import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getAlbumCoverIndex, pickRandomAlbumCover } from '@/features/puzzle/albumCovers';
import { BoardFrame, getBoardInnerSize } from '@/features/puzzle/BoardFrame';
import { TimeUpPanel } from '@/features/puzzle/components/TimeUpPanel';
import { PuzzleBoard } from '@/features/puzzle/PuzzleBoard';
import {
  parseTimerModeParam,
  TIMER_MODE_DURATIONS,
  timerModeParam,
} from '@/features/puzzle/modifiers/timerMode';
import { calculatePuzzleScore } from '@/features/puzzle/scoring';
import { useCountdownTimer } from '@/features/puzzle/useCountdownTimer';
import { useElapsedTimer } from '@/features/puzzle/useElapsedTimer';
import { usePuzzleTileImages } from '@/features/puzzle/usePuzzleTileImages';
import { usePuzzleGame } from '@/features/puzzle/usePuzzleGame';
import { DEFAULT_MODE, GAME_MODES, type GameModeKey } from '@/features/puzzle/types';
import { PUZZLE_COMPLETE_NAVIGATION_DELAY_MS } from '@/features/puzzle/completionCelebration';
import { calculateProgressPercent } from '@/features/puzzle/utils';

/** Top padding, mode title, stats row, and spacing below stats (original layout). */
const TOP_HEADER_CHROME = 18 + 36 + 8 + 22 + 20;
/** Score summary, shuffle button, and bottom padding. */
const FOOTER_CHROME = 88 + 14 + 14 + 18 + 18;

const getModeFromParam = (modeParam?: string): GameModeKey => {
  if (modeParam === 'advanced') {
    return 'advanced';
  }
  if (modeParam === 'normal') {
    return 'normal';
  }
  return DEFAULT_MODE;
};

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string; timerMode?: string }>();
  const mode = getModeFromParam(params.mode);
  const timerModeEnabled = parseTimerModeParam(params.timerMode);
  const config = GAME_MODES[mode];
  const [puzzleImage, setPuzzleImage] = useState(pickRandomAlbumCover);
  const [shuffleGeneration, setShuffleGeneration] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const isFirstGameFocus = useRef(true);
  const hasNavigatedToComplete = useRef(false);
  const completeNavigationRef = useRef({
    mode,
    timerModeEnabled,
    moves: 0,
    timeSecondsForScore: 0,
    remainingSeconds: 0,
    elapsedSeconds: 0,
    puzzleImage,
  });

  useFocusEffect(
    useCallback(() => {
      if (isFirstGameFocus.current) {
        isFirstGameFocus.current = false;
        return;
      }

      setPuzzleImage((current) => pickRandomAlbumCover(current));
    }, []),
  );
  const timerResetKey = `${mode}-${config.gridSize}-${shuffleGeneration}`;

  const { board, moves, onShuffle, onTilePress, won } = usePuzzleGame({ gridSize: config.gridSize });

  const handleTimeExpired = useCallback(() => {
    setTimeUp(true);
  }, []);

  const elapsedTimer = useElapsedTimer({
    paused: timerModeEnabled || won || timeUp,
    resetKey: timerResetKey,
  });

  const countdownDuration = TIMER_MODE_DURATIONS[mode];
  const countdownTimer = useCountdownTimer({
    durationSeconds: countdownDuration,
    paused: !timerModeEnabled || won || timeUp,
    resetKey: timerResetKey,
    onExpire: handleTimeExpired,
  });

  const gameLocked = won || timeUp;
  const timeSecondsForScore = timerModeEnabled
    ? countdownTimer.elapsedSeconds
    : elapsedTimer.seconds;

  completeNavigationRef.current = {
    mode,
    timerModeEnabled,
    moves,
    timeSecondsForScore,
    remainingSeconds: countdownTimer.remainingSeconds,
    elapsedSeconds: elapsedTimer.seconds,
    puzzleImage,
  };

  const progressPercent = useMemo(
    () => calculateProgressPercent(board, config.gridSize),
    [board, config.gridSize],
  );

  const handleTilePress = useCallback(
    (tile: number) => {
      if (gameLocked) {
        return;
      }
      onTilePress(tile);
    },
    [gameLocked, onTilePress],
  );

  const handleShuffle = () => {
    onShuffle();
    setPuzzleImage((current) => pickRandomAlbumCover(current));
    setShuffleGeneration((generation) => generation + 1);
    setTimeUp(false);
  };

  const handleRetry = () => {
    handleShuffle();
  };

  useEffect(() => {
    if (!won) {
      hasNavigatedToComplete.current = false;
      return;
    }

    if (hasNavigatedToComplete.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (hasNavigatedToComplete.current) {
        return;
      }

      hasNavigatedToComplete.current = true;

      const snapshot = completeNavigationRef.current;
      const result = calculatePuzzleScore(
        snapshot.mode,
        snapshot.timeSecondsForScore,
        snapshot.moves,
      );
      const preservedTimeSeconds = snapshot.timerModeEnabled
        ? snapshot.remainingSeconds
        : snapshot.elapsedSeconds;

      router.replace({
        pathname: '/complete',
        params: {
          mode: snapshot.mode,
          timerMode: timerModeParam(snapshot.timerModeEnabled),
          score: String(result.score),
          moves: String(snapshot.moves),
          timeSeconds: String(preservedTimeSeconds),
          albumCoverIndex: String(getAlbumCoverIndex(snapshot.puzzleImage)),
        },
      } as unknown as Href);
    }, PUZZLE_COMPLETE_NAVIGATION_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [won]);

  const { tileSources, loading: tileImagesLoading } = usePuzzleTileImages(
    puzzleImage,
    config.gridSize,
  );

  const frameSize = useMemo(() => {
    const horizontalPadding = 20 * 2;
    const availableWidth = width - horizontalPadding;
    const maxBoardHeight =
      height -
      headerHeight -
      insets.bottom -
      TOP_HEADER_CHROME -
      FOOTER_CHROME;
    const availableHeight = Math.max(220, maxBoardHeight);
    return Math.min(availableWidth, availableHeight);
  }, [headerHeight, height, insets.bottom, width]);

  const boardSize = getBoardInnerSize(frameSize);
  const timeLabel = timerModeEnabled ? 'Time Left' : 'Time';
  const timeDisplay = timerModeEnabled ? countdownTimer.formatted : elapsedTimer.formatted;

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: 'Sliding Puzzle',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#020617',
          },
          headerTintColor: '#e2e8f0',
          headerShadowVisible: false,
          headerBackTitle: 'Back',
          headerBackButtonDisplayMode: 'default',
        }}
      />
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.headerSection}>
            <Text style={styles.modeName}>
              {config.title}
              {timerModeEnabled ? ' • Timer' : ''}
            </Text>
            <Text style={styles.meta}>
              {config.gridSize}x{config.gridSize} • Moves: {moves} • {timeLabel}: {timeDisplay}
            </Text>
          </View>

          <View style={styles.boardCenter}>
            <View style={styles.boardShell}>
              <BoardFrame celebrating={won} size={frameSize}>
                <PuzzleBoard
                  board={board}
                  gridSize={config.gridSize}
                  onTilePress={handleTilePress}
                  size={boardSize}
                  tileImagesLoading={tileImagesLoading}
                  tileSources={tileSources}
                />
              </BoardFrame>
            </View>
          </View>

          <View style={styles.footer}>
            {timeUp ? (
              <TimeUpPanel moves={moves} onRetry={handleRetry} progressPercent={progressPercent} />
            ) : (
              <View style={styles.scorePlaceholder} />
            )}
            {!timeUp ? (
              <Pressable disabled={won} onPress={handleShuffle} style={[styles.actionButton, won && styles.actionButtonDisabled]}>
                <Text style={styles.actionText}>Shuffle</Text>
              </Pressable>
            ) : null}
          </View>
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
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 18,
  },
  boardCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modeName: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: 28,
  },
  meta: {
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
  },
  boardShell: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    paddingBottom: 18,
    gap: 14,
  },
  scoreSummary: {
    minHeight: 88,
    justifyContent: 'center',
    gap: 4,
  },
  scoreLine: {
    color: '#22c55e',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  scorePlaceholder: {
    minHeight: 88,
  },
  actionButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionText: {
    color: '#eff6ff',
    fontWeight: '700',
    fontSize: 16,
  },
});
