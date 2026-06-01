import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getAlbumCoverByIndex } from '@/features/puzzle/albumCovers';
import { AlbumCoverFrame } from '@/features/puzzle/components/AlbumCoverFrame';
import { BRAND_PRIMARY } from '@/features/puzzle/components/ModeSelectButton';
import { parseTimerModeParam } from '@/features/puzzle/modifiers/timerMode';
import { formatElapsed } from '@/features/puzzle/useElapsedTimer';
import { DEFAULT_MODE, GAME_MODES, type GameModeKey } from '@/features/puzzle/types';

const HORIZONTAL_PADDING = 40;
const PAGE_PADDING_VERTICAL = 12;
const TITLE_BLOCK_HEIGHT = 46;
const STAT_LINE_HEIGHT = 22;
const STAT_GAP = 6;
const NORMAL_MODE_STAT_COUNT = 3;
const TIMER_MODE_STAT_COUNT = 5;
const ACTION_BUTTON_HEIGHT = 44;
const ACTION_GAP = 10;
const CONTENT_STACK_GAP = 8;
const CONTENT_TO_ACTIONS_GAP = 16;
const FRAME_SIZE_SCALE = 1.25;
const BASE_MAX_FRAME_SIZE = 268;
const MAX_FRAME_SIZE = Math.round(BASE_MAX_FRAME_SIZE * FRAME_SIZE_SCALE);
const MIN_FRAME_SIZE = Math.round(148 * FRAME_SIZE_SCALE);

const getModeFromParam = (modeParam?: string): GameModeKey => {
  if (modeParam === 'advanced') {
    return 'advanced';
  }
  if (modeParam === 'normal') {
    return 'normal';
  }
  return DEFAULT_MODE;
};

const parseNumberParam = (value?: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const useCompleteFrameSize = (statCount: number) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const statsHeight = statCount * STAT_LINE_HEIGHT + (statCount - 1) * STAT_GAP;
    const actionsHeight = ACTION_BUTTON_HEIGHT * 3 + ACTION_GAP * 2;
    const contentStackGaps = CONTENT_STACK_GAP * 2;

    const reservedHeight =
      insets.top +
      insets.bottom +
      PAGE_PADDING_VERTICAL * 2 +
      TITLE_BLOCK_HEIGHT +
      statsHeight +
      contentStackGaps +
      CONTENT_TO_ACTIONS_GAP +
      actionsHeight;

    const maxFrameByHeight = height - reservedHeight;
    const maxFrameByWidth = width - HORIZONTAL_PADDING;

    return Math.max(
      MIN_FRAME_SIZE,
      Math.min(maxFrameByWidth, maxFrameByHeight, MAX_FRAME_SIZE),
    );
  }, [height, insets.bottom, insets.top, statCount, width]);
};

export default function PuzzleCompleteScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    timerMode?: string;
    score?: string;
    bonusScore?: string;
    totalScore?: string;
    moves?: string;
    timeSeconds?: string;
    albumCoverIndex?: string;
  }>();

  const mode = getModeFromParam(params.mode);
  const timerModeEnabled = parseTimerModeParam(params.timerMode);
  const baseScore = parseNumberParam(params.score);
  const bonusScore = parseNumberParam(params.bonusScore);
  const totalScore = parseNumberParam(params.totalScore) || baseScore;
  const moves = parseNumberParam(params.moves);
  const timeSeconds = parseNumberParam(params.timeSeconds);
  const albumCover = getAlbumCoverByIndex(parseNumberParam(params.albumCoverIndex));
  const statCount = timerModeEnabled ? TIMER_MODE_STAT_COUNT : NORMAL_MODE_STAT_COUNT;
  const frameSize = useCompleteFrameSize(statCount);

  const formattedTime = formatElapsed(timeSeconds);
  const modeTitle = GAME_MODES[mode].title;

  const shareResult = async () => {
    if (timerModeEnabled) {
      await Share.share({
        message: `Puzzle complete on ${modeTitle}! Score: ${baseScore}. Bonus Score: ${bonusScore}. Total Score: ${totalScore}. Remaining Time: ${formattedTime}. Total Moves: ${moves}.`,
      });
      return;
    }

    await Share.share({
      message: `Puzzle complete on ${modeTitle}! Score: ${baseScore}. Time Elapsed: ${formattedTime}. Total Moves: ${moves}.`,
    });
  };

  const returnToHome = () => {
    router.replace('/');
  };

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.container}>
        <View style={styles.screen}>
          <View style={styles.topSpacer} />

          <View style={styles.completionContent}>
            <View style={styles.titleBlock}>
              <Text style={styles.heading}>Puzzle Complete!</Text>
              <Text style={styles.subheading}>You solved the {modeTitle} challenge</Text>
            </View>

            <AlbumCoverFrame imageSource={albumCover} size={frameSize} />

            <View style={styles.stats}>
              {timerModeEnabled ? (
                <>
                  <Text style={styles.statLine}>Score: {baseScore}</Text>
                  <Text style={styles.statLine}>Bonus Score: {bonusScore}</Text>
                  <Text style={styles.statLine}>Total Score: {totalScore}</Text>
                  <Text style={styles.statLine}>Remaining Time: {formattedTime}</Text>
                  <Text style={styles.statLine}>Total Moves: {moves}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.statLine}>Score: {baseScore}</Text>
                  <Text style={styles.statLine}>Time Elapsed: {formattedTime}</Text>
                  <Text style={styles.statLine}>Total Moves: {moves}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => void shareResult()} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </Pressable>
            <Pressable onPress={returnToHome} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>
            <Pressable
              disabled
              style={[styles.secondaryButton, styles.secondaryButtonDisabled]}
            >
              <Text style={[styles.secondaryButtonText, styles.secondaryButtonTextDisabled]}>
                Exit
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: PAGE_PADDING_VERTICAL,
    alignItems: 'center',
  },
  topSpacer: {
    flex: 1,
    width: '100%',
  },
  completionContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    gap: CONTENT_STACK_GAP,
    flexShrink: 0,
  },
  titleBlock: {
    alignItems: 'center',
    width: '100%',
  },
  heading: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheading: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  stats: {
    width: '100%',
    gap: STAT_GAP,
    alignItems: 'center',
  },
  statLine: {
    color: '#3f1cec',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: STAT_LINE_HEIGHT,
    width: '100%',
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    gap: ACTION_GAP,
    marginTop: CONTENT_TO_ACTIONS_GAP,
    flexShrink: 0,
  },
  bottomSpacer: {
    flex: 1,
    width: '100%',
  },
  shareButton: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    height: ACTION_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  shareButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 14,
    height: ACTION_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    height: ACTION_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  secondaryButtonDisabled: {
    opacity: 0.45,
  },
  secondaryButtonText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonTextDisabled: {
    color: '#64748b',
  },
});
