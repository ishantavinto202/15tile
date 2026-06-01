/** Matches PuzzleTile slide duration. */
export const TILE_MOVE_DURATION_MS = 180;

/** Pause after the final tile lands before the celebration starts. */
export const CELEBRATION_PAUSE_MS = 200;

/** Scale, glow pulse, and star burst. */
export const CELEBRATION_DURATION_MS = 700;

export const CELEBRATION_START_DELAY_MS = TILE_MOVE_DURATION_MS + CELEBRATION_PAUSE_MS;

export const PUZZLE_COMPLETE_NAVIGATION_DELAY_MS =
  CELEBRATION_START_DELAY_MS + CELEBRATION_DURATION_MS;

export const CELEBRATION_PRIMARY = '#3F1CEC';
export const CELEBRATION_GOLD = '#E8B923';
export const CELEBRATION_WHITE = '#FFFFFF';
