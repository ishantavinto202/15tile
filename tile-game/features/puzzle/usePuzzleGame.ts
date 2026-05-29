import { useCallback, useMemo, useState } from 'react';

import { canMoveTile, isSolved, moveTile, shuffleBoard } from '@/features/puzzle/utils';

interface UsePuzzleGameOptions {
  gridSize: number;
}

interface UsePuzzleGameResult {
  board: number[];
  won: boolean;
  moves: number;
  onTilePress: (tile: number) => void;
  onShuffle: () => void;
}

export const usePuzzleGame = ({ gridSize }: UsePuzzleGameOptions): UsePuzzleGameResult => {
  const [board, setBoard] = useState<number[]>(() => shuffleBoard(gridSize));
  const [moves, setMoves] = useState(0);

  const won = useMemo(() => isSolved(board, gridSize), [board, gridSize]);

  const onTilePress = useCallback(
    (tile: number) => {
      setBoard((prev) => {
        if (!canMoveTile(prev, tile, gridSize)) {
          return prev;
        }

        setMoves((current) => current + 1);
        return moveTile(prev, tile, gridSize);
      });
    },
    [gridSize],
  );

  const onShuffle = useCallback(() => {
    setBoard(shuffleBoard(gridSize));
    setMoves(0);
  }, [gridSize]);

  return {
    board,
    won,
    moves,
    onTilePress,
    onShuffle,
  };
};
