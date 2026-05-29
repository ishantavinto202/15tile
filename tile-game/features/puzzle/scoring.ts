import type { GameModeKey } from '@/features/puzzle/types';

export const SCORE_TIERS: Record<GameModeKey, readonly [number, number, number, number]> = {
  normal: [100, 75, 50, 25],
  advanced: [500, 375, 250, 125],
};

/** Seconds at or below = 100% time performance. */
const TIME_EXCELLENT: Record<GameModeKey, number> = {
  normal: 60,
  advanced: 180,
};

/** Seconds at or above = 0% time performance. */
const TIME_POOR: Record<GameModeKey, number> = {
  normal: 240,
  advanced: 600,
};

/** Moves at or below = 100% move efficiency. */
const MOVES_EXCELLENT: Record<GameModeKey, number> = {
  normal: 25,
  advanced: 60,
};

/** Moves at or above = 0% move efficiency. */
const MOVES_POOR: Record<GameModeKey, number> = {
  normal: 70,
  advanced: 200,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Linear 0–100 score: better values (lower time/moves) score higher. */
const performancePercent = (value: number, excellent: number, poor: number): number => {
  if (value <= excellent) {
    return 100;
  }
  if (value >= poor) {
    return 0;
  }

  const progress = (poor - value) / (poor - excellent);
  return clamp(progress * 100, 0, 100);
};

export interface PuzzleScoreResult {
  score: number;
  tier: 'excellent' | 'great' | 'good' | 'completed';
  timeSeconds: number;
  moves: number;
}

export const calculatePuzzleScore = (
  mode: GameModeKey,
  timeSeconds: number,
  moves: number,
): PuzzleScoreResult => {
  const timePerformance = performancePercent(
    timeSeconds,
    TIME_EXCELLENT[mode],
    TIME_POOR[mode],
  );
  const moveEfficiency = performancePercent(moves, MOVES_EXCELLENT[mode], MOVES_POOR[mode]);
  const combined = timePerformance * 0.7 + moveEfficiency * 0.3;

  const [excellent, great, good, completed] = SCORE_TIERS[mode];
  let score = completed;
  let tier: PuzzleScoreResult['tier'] = 'completed';

  if (combined >= 85) {
    score = excellent;
    tier = 'excellent';
  } else if (combined >= 65) {
    score = great;
    tier = 'great';
  } else if (combined >= 40) {
    score = good;
    tier = 'good';
  }

  return {
    score,
    tier,
    timeSeconds,
    moves,
  };
};
