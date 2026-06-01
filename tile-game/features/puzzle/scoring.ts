import { TIMER_MODE_DURATIONS } from '@/features/puzzle/modifiers/timerMode';
import type { GameModeKey } from '@/features/puzzle/types';

export const SCORE_INCREMENT = 25;
export const SCORE_MIN = 25;

/** Highest base score from completion speed (Timer Mode). */
const SCORE_MAX: Record<GameModeKey, number> = {
  normal: 200,
  advanced: 400,
};

/** Maximum bonus points from remaining time (Timer Mode). */
const REMAINING_TIME_BONUS_MAX: Record<GameModeKey, number> = {
  normal: 100,
  advanced: 200,
};

/** Moves at or below = 100% move efficiency (Normal Mode). */
const MOVES_EXCELLENT: Record<GameModeKey, number> = {
  normal: 25,
  advanced: 60,
};

/** Moves at or above = 0% move efficiency (Normal Mode). */
const MOVES_POOR: Record<GameModeKey, number> = {
  normal: 70,
  advanced: 200,
};

/** Seconds at or below = 100% speed (Timer Mode base score). */
const TIME_EXCELLENT: Record<GameModeKey, number> = {
  normal: 20,
  advanced: 60,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Linear 0–100: lower time/moves score higher. */
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

const roundToScoreIncrement = (rawScore: number, maxScore: number): number => {
  const rounded = Math.round(rawScore / SCORE_INCREMENT) * SCORE_INCREMENT;
  return clamp(rounded, SCORE_MIN, maxScore);
};

const rawPerformanceScore = (performance: number, maxScore: number): number =>
  SCORE_MIN + (performance / 100) * (maxScore - SCORE_MIN);

const getTimerModeScoreCap = (mode: GameModeKey): number =>
  SCORE_MAX[mode] + REMAINING_TIME_BONUS_MAX[mode];

const calculateMoveBasedScore = (mode: GameModeKey, moves: number): number => {
  const performance = performancePercent(moves, MOVES_EXCELLENT[mode], MOVES_POOR[mode]);
  const rawScore = rawPerformanceScore(performance, SCORE_MAX[mode]);
  return roundToScoreIncrement(rawScore, SCORE_MAX[mode]);
};

const calculateTimerModeScores = (
  mode: GameModeKey,
  elapsedSeconds: number,
  remainingSeconds: number,
): { baseScore: number; bonusScore: number; totalScore: number } => {
  const duration = TIMER_MODE_DURATIONS[mode];
  const speedPerformance = performancePercent(
    elapsedSeconds,
    TIME_EXCELLENT[mode],
    duration,
  );
  const baseRaw = rawPerformanceScore(speedPerformance, SCORE_MAX[mode]);
  const baseScore = roundToScoreIncrement(baseRaw, SCORE_MAX[mode]);

  const bonusRaw =
    remainingSeconds > 0
      ? (clamp(remainingSeconds, 0, duration) / duration) * REMAINING_TIME_BONUS_MAX[mode]
      : 0;
  const bonusScore = roundToScoreIncrement(bonusRaw, REMAINING_TIME_BONUS_MAX[mode]);

  const totalScore = clamp(baseScore + bonusScore, SCORE_MIN, getTimerModeScoreCap(mode));

  return { baseScore, bonusScore, totalScore };
};

export interface PuzzleScoreResult {
  /** Base score (speed in Timer Mode, final score in Normal Mode). */
  score: number;
  bonusScore: number;
  totalScore: number;
  timeSeconds: number;
  moves: number;
}

export const calculatePuzzleScore = (
  mode: GameModeKey,
  timeSeconds: number,
  moves: number,
  timerModeEnabled: boolean,
  remainingSeconds = 0,
): PuzzleScoreResult => {
  if (timerModeEnabled) {
    const { baseScore, bonusScore, totalScore } = calculateTimerModeScores(
      mode,
      timeSeconds,
      remainingSeconds,
    );

    return {
      score: baseScore,
      bonusScore,
      totalScore,
      timeSeconds,
      moves,
    };
  }

  const score = calculateMoveBasedScore(mode, moves);

  return {
    score,
    bonusScore: 0,
    totalScore: score,
    timeSeconds,
    moves,
  };
};
