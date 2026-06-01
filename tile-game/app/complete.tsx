import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getAlbumCoverByIndex } from '@/features/puzzle/albumCovers';
import { AlbumCoverFrame } from '@/features/puzzle/components/AlbumCoverFrame';
import { BRAND_PRIMARY } from '@/features/puzzle/components/ModeSelectButton';
import { parseTimerModeParam, timerModeParam } from '@/features/puzzle/modifiers/timerMode';
import { formatElapsed } from '@/features/puzzle/useElapsedTimer';
import { DEFAULT_MODE, GAME_MODES, type GameModeKey } from '@/features/puzzle/types';

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

export default function PuzzleCompleteScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    mode?: string;
    timerMode?: string;
    score?: string;
    moves?: string;
    timeSeconds?: string;
    albumCoverIndex?: string;
  }>();

  const mode = getModeFromParam(params.mode);
  const timerModeEnabled = parseTimerModeParam(params.timerMode);
  const score = parseNumberParam(params.score);
  const moves = parseNumberParam(params.moves);
  const timeSeconds = parseNumberParam(params.timeSeconds);
  const albumCover = getAlbumCoverByIndex(parseNumberParam(params.albumCoverIndex));

  const frameSize = useMemo(() => {
    const horizontalPadding = 20 * 2;
    return Math.min(width - horizontalPadding, 320);
  }, [width]);

  const timeLabel = timerModeEnabled ? 'Remaining Time' : 'Time Elapsed';
  const formattedTime = formatElapsed(timeSeconds);
  const modeTitle = GAME_MODES[mode].title;

  const shareResult = async () => {
    const timeLine = `${timeLabel}: ${formattedTime}`;
    await Share.share({
      message: `Puzzle complete on ${modeTitle}! Score: ${score}. Total Moves: ${moves}. ${timeLine}`,
    });
  };

  const playAgain = () => {
    router.replace({
      pathname: '/game',
      params: { mode, timerMode: timerModeParam(timerModeEnabled) },
    });
  };

  const exitToHome = () => {
    router.replace('/');
  };

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Puzzle Complete!</Text>
          <Text style={styles.subheading}>You solved the {modeTitle} challenge</Text>

          <View style={styles.heroSection}>
            <AlbumCoverFrame imageSource={albumCover} size={frameSize} />
          </View>

          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Your Results</Text>
            <Text style={styles.statLine}>Score: {score}</Text>
            <Text style={styles.statLine}>Total Moves: {moves}</Text>
            <Text style={styles.statLine}>
              {timeLabel}: {formattedTime}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => void shareResult()} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </Pressable>
            <Pressable onPress={playAgain} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>
            <Pressable onPress={exitToHome} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Exit</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 20,
  },
  heading: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheading: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: -8,
  },
  heroSection: {
    marginTop: 4,
    marginBottom: 4,
  },
  resultsCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  resultsTitle: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLine: {
    color: '#22c55e',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
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
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  secondaryButtonText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 16,
  },
});
