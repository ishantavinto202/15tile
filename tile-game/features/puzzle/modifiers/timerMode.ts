import type { GameModeKey } from '@/features/puzzle/types';

export const TIMER_MODE_STORAGE_KEY = '@tilegame/timerModeEnabled';

/** Countdown duration per tile mode when Timer Mode is on. */
export const TIMER_MODE_DURATIONS: Record<GameModeKey, number> = {
  normal: 120,
  advanced: 240,
};

export const parseTimerModeParam = (value?: string): boolean => value === '1' || value === 'true';

export const timerModeParam = (enabled: boolean): string => (enabled ? '1' : '0');
