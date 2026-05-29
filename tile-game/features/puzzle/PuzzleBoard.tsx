import { memo, useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { PuzzleTile } from '@/features/puzzle/PuzzleTile';
import { canMoveTile } from '@/features/puzzle/utils';

interface PuzzleBoardProps {
  board: number[];
  gridSize: number;
  size: number;
  tileSources: Record<number, ImageSourcePropType>;
  tileImagesLoading?: boolean;
  onTilePress: (tile: number) => void;
}

const PuzzleBoardComponent = ({
  board,
  gridSize,
  size,
  tileSources,
  tileImagesLoading = false,
  onTilePress,
}: PuzzleBoardProps) => {
  const tileSize = useMemo(() => size / gridSize, [gridSize, size]);

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {board.map((value, index) => {
        if (value === 0) {
          return null;
        }

        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const movable = canMoveTile(board, value, gridSize);

        return (
          <PuzzleTile
            key={value}
            col={col}
            disabled={!movable || tileImagesLoading}
            onPress={onTilePress}
            row={row}
            tileSize={tileSize}
            tileSource={tileSources[value]}
            value={value}
          />
        );
      })}
    </View>
  );
};

export const PuzzleBoard = memo(PuzzleBoardComponent);

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: '#000000',
  },
});
