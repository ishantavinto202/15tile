import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { BoardFrame, getBoardInnerSize } from '@/features/puzzle/BoardFrame';
import { PuzzleBoard } from '@/features/puzzle/PuzzleBoard';
import { usePuzzleTileImages } from '@/features/puzzle/usePuzzleTileImages';
import { DEFAULT_MODE, GAME_MODES, type GameModeKey } from '@/features/puzzle/types';
import { calculatePuzzleScore } from '@/features/puzzle/scoring';
import { formatElapsed, useElapsedTimer } from '@/features/puzzle/useElapsedTimer';
import { usePuzzleGame } from '@/features/puzzle/usePuzzleGame';

const PUZZLE_IMAGE = require('../assets/PinkFloyd.png');

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
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = getModeFromParam(params.mode);
  const config = GAME_MODES[mode];
  const [shuffleGeneration, setShuffleGeneration] = useState(0);
  const { board, moves, onShuffle, onTilePress, won } = usePuzzleGame({ gridSize: config.gridSize });
  const { formatted: elapsed, seconds: elapsedSeconds } = useElapsedTimer({
    paused: won,
    resetKey: `${mode}-${config.gridSize}-${shuffleGeneration}`,
  });

  const completionScore = useMemo(() => {
    if (!won) {
      return null;
    }

    return calculatePuzzleScore(mode, elapsedSeconds, moves);
  }, [elapsedSeconds, mode, moves, won]);

  const handleShuffle = () => {
    onShuffle();
    setShuffleGeneration((generation) => generation + 1);
  };
  const { tileSources, loading: tileImagesLoading } = usePuzzleTileImages(
    PUZZLE_IMAGE,
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
            <Text style={styles.modeName}>{config.title}</Text>
            <Text style={styles.meta}>
              {config.gridSize}x{config.gridSize} • Moves: {moves} • Time: {elapsed}
            </Text>
          </View>

          <View style={styles.boardCenter}>
            <View style={styles.boardShell}>
              <BoardFrame size={frameSize}>
                <PuzzleBoard
                  board={board}
                  gridSize={config.gridSize}
                  onTilePress={onTilePress}
                  size={boardSize}
                  tileImagesLoading={tileImagesLoading}
                  tileSources={tileSources}
                />
              </BoardFrame>
            </View>
          </View>

          <View style={styles.footer}>
            {completionScore ? (
              <View style={styles.scoreSummary}>
                <Text style={styles.scoreLine}>Score: {completionScore.score}</Text>
                <Text style={styles.scoreLine}>Time: {formatElapsed(completionScore.timeSeconds)}</Text>
                <Text style={styles.scoreLine}>Moves: {completionScore.moves}</Text>
              </View>
            ) : (
              <View style={styles.scorePlaceholder} />
            )}
            <Pressable onPress={handleShuffle} style={styles.actionButton}>
              <Text style={styles.actionText}>Shuffle</Text>
            </Pressable>
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
  actionText: {
    color: '#eff6ff',
    fontWeight: '700',
    fontSize: 16,
  },
});
