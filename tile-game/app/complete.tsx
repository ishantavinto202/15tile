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

const SCREEN_BACKGROUND = '#000000';
const TEXT_PRIMARY = '#FFFFFF';
const BUTTON_SECONDARY = '#2A2A2E';

const HORIZONTAL_PADDING = 48;
const SCREEN_PADDING_TOP = 16;
const SCREEN_PADDING_BOTTOM = 20;
const TITLE_BLOCK_HEIGHT = 54;
const STAT_LINE_HEIGHT = 24;
const STAT_GAP = 10;
const NORMAL_MODE_STAT_COUNT = 3;
const TIMER_MODE_STAT_COUNT = 5;
const ACTION_BUTTON_HEIGHT = 52;
const ACTION_GAP = 12;
const GAP_TITLE_TO_ARTWORK = 28;
const GAP_STATS_TO_ACTIONS = 32;
const FRAME_SIZE_SCALE = 1.25;
const BASE_MAX_FRAME_SIZE = 268;
const MAX_FRAME_SIZE = Math.round(BASE_MAX_FRAME_SIZE * FRAME_SIZE_SCALE);
const MIN_FRAME_SIZE = Math.round(148 * FRAME_SIZE_SCALE);
const BUTTON_MAX_WIDTH = 340;

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

    const reservedHeight =
      insets.top +
      insets.bottom +
      SCREEN_PADDING_TOP +
      SCREEN_PADDING_BOTTOM +
      TITLE_BLOCK_HEIGHT +
      GAP_TITLE_TO_ARTWORK +
      statsHeight +
      GAP_STATS_TO_ACTIONS +
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
          <View style={styles.hero}>
            <View style={styles.titleBlock}>
              <Text style={styles.heading}>Puzzle Complete!</Text>
              <Text style={styles.subheading}>You solved the {modeTitle} Challenge</Text>
            </View>

            <View style={styles.artworkWrap}>
              <AlbumCoverFrame imageSource={albumCover} size={frameSize} />
            </View>
          </View>

          <View style={styles.lower}>
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

            <View style={styles.actions}>
              <Pressable onPress={() => void shareResult()} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Share</Text>
              </Pressable>
              <Pressable onPress={returnToHome} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Play</Text>
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
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: SCREEN_PADDING_TOP,
    paddingBottom: SCREEN_PADDING_BOTTOM,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    width: '100%',
    flexShrink: 1,
  },
  lower: {
    width: '100%',
    alignItems: 'center',
    flexShrink: 0,
  },
  titleBlock: {
    alignItems: 'center',
    width: '100%',
    maxWidth: BUTTON_MAX_WIDTH,
  },
  heading: {
    color: TEXT_PRIMARY,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subheading: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },
  artworkWrap: {
    marginTop: GAP_TITLE_TO_ARTWORK,
    alignItems: 'center',
  },
  stats: {
    width: '100%',
    maxWidth: BUTTON_MAX_WIDTH,
    gap: STAT_GAP,
    alignItems: 'center',
    marginBottom: GAP_STATS_TO_ACTIONS,
  },
  statLine: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: STAT_LINE_HEIGHT,
    width: '100%',
  },
  actions: {
    width: '100%',
    maxWidth: BUTTON_MAX_WIDTH,
    gap: ACTION_GAP,
  },
  secondaryButton: {
    backgroundColor: BUTTON_SECONDARY,
    borderRadius: 12,
    height: ACTION_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonText: {
    color: TEXT_PRIMARY,
    fontWeight: '600',
    fontSize: 17,
  },
  secondaryButtonTextDisabled: {
    color: '#A3A3A3',
  },
  primaryButton: {
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 12,
    height: ACTION_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 17,
  },
});
