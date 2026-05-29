import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { BoardFrame, getBoardInnerSize } from '@/features/puzzle/BoardFrame';
import { PuzzleBoard } from '@/features/puzzle/PuzzleBoard';
import { usePuzzleTileImages } from '@/features/puzzle/usePuzzleTileImages';
import { DEFAULT_MODE, GAME_MODES, type GameModeKey } from '@/features/puzzle/types';
import { usePuzzleGame } from '@/features/puzzle/usePuzzleGame';

const PUZZLE_IMAGE = require('../assets/PinkFloyd.png');

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
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = getModeFromParam(params.mode);
  const config = GAME_MODES[mode];
  const { board, moves, onShuffle, onTilePress, won } = usePuzzleGame({ gridSize: config.gridSize });
  const { tileSources, loading: tileImagesLoading } = usePuzzleTileImages(
    PUZZLE_IMAGE,
    config.gridSize,
  );

  const frameSize = useMemo(() => {
    const horizontalPadding = 20 * 2;
    const availableWidth = width - horizontalPadding;
    const availableHeight = height * 0.58;
    return Math.max(220, Math.min(availableWidth, availableHeight));
  }, [height, width]);

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
        <Text style={styles.modeName}>{config.title}</Text>
        <Text style={styles.meta}>
          {config.gridSize}x{config.gridSize} • Moves: {moves}
        </Text>

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

        {won ? <Text style={styles.winText}>Solved! Nice work.</Text> : <Text style={styles.winText}> </Text>}

        <View style={styles.actions}>
          <Pressable onPress={onShuffle} style={styles.actionButton}>
            <Text style={styles.actionText}>Shuffle</Text>
          </Pressable>
          <Link asChild href="/">
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Change Mode</Text>
            </Pressable>
          </Link>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
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
  winText: {
    color: '#22c55e',
    marginTop: 20,
    minHeight: 24,
    fontWeight: '700',
    fontSize: 18,
  },
  actions: {
    marginTop: 'auto',
    width: '100%',
    gap: 12,
    paddingBottom: 18,
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
  secondaryButton: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 15,
  },
});
