const EMPTY_TILE = 0;

export const createSolvedBoard = (gridSize: number): number[] => {
  const last = gridSize * gridSize;
  return Array.from({ length: last }, (_, index) =>
    index + 1 === last ? EMPTY_TILE : index + 1,
  );
};

const countInversions = (tiles: number[]): number => {
  const filtered = tiles.filter((value) => value !== EMPTY_TILE);
  let inversions = 0;

  for (let i = 0; i < filtered.length; i += 1) {
    for (let j = i + 1; j < filtered.length; j += 1) {
      if (filtered[i] > filtered[j]) {
        inversions += 1;
      }
    }
  }

  return inversions;
};

const getEmptyRowFromBottom = (tiles: number[], gridSize: number): number => {
  const emptyIndex = tiles.indexOf(EMPTY_TILE);
  const rowFromTop = Math.floor(emptyIndex / gridSize);
  return gridSize - rowFromTop;
};

export const isSolvable = (tiles: number[], gridSize: number): boolean => {
  const inversions = countInversions(tiles);

  if (gridSize % 2 !== 0) {
    return inversions % 2 === 0;
  }

  const emptyRowFromBottom = getEmptyRowFromBottom(tiles, gridSize);
  const isEmptyRowEven = emptyRowFromBottom % 2 === 0;
  const isInversionsEven = inversions % 2 === 0;

  return isEmptyRowEven ? !isInversionsEven : isInversionsEven;
};

const areBoardsEqual = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export const shuffleBoard = (gridSize: number): number[] => {
  const solved = createSolvedBoard(gridSize);
  const shuffled = [...solved];

  do {
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } while (!isSolvable(shuffled, gridSize) || areBoardsEqual(shuffled, solved));

  return shuffled;
};

export const isSolved = (tiles: number[], gridSize: number): boolean =>
  areBoardsEqual(tiles, createSolvedBoard(gridSize));

export const canMoveTile = (
  board: number[],
  tile: number,
  gridSize: number,
): boolean => {
  const tileIndex = board.indexOf(tile);
  const emptyIndex = board.indexOf(EMPTY_TILE);

  if (tileIndex < 0 || emptyIndex < 0) {
    return false;
  }

  const tileRow = Math.floor(tileIndex / gridSize);
  const tileCol = tileIndex % gridSize;
  const emptyRow = Math.floor(emptyIndex / gridSize);
  const emptyCol = emptyIndex % gridSize;

  const rowDiff = Math.abs(tileRow - emptyRow);
  const colDiff = Math.abs(tileCol - emptyCol);

  return rowDiff + colDiff === 1;
};

export const moveTile = (
  board: number[],
  tile: number,
  gridSize: number,
): number[] => {
  if (!canMoveTile(board, tile, gridSize)) {
    return board;
  }

  const tileIndex = board.indexOf(tile);
  const emptyIndex = board.indexOf(EMPTY_TILE);
  const next = [...board];
  [next[tileIndex], next[emptyIndex]] = [next[emptyIndex], next[tileIndex]];
  return next;
};
