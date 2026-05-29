export type GameModeKey = 'normal' | 'advanced';

export interface GameModeConfig {
  key: GameModeKey;
  title: string;
  description: string;
  gridSize: number;
}

export const GAME_MODES: Record<GameModeKey, GameModeConfig> = {
  normal: {
    key: 'normal',
    title: 'Normal Mode',
    description: '3x3 grid (8 tiles)',
    gridSize: 3,
  },
  advanced: {
    key: 'advanced',
    title: 'Advanced Mode',
    description: '4x4 grid (15 tiles)',
    gridSize: 4,
  },
};

export const DEFAULT_MODE: GameModeKey = 'normal';
