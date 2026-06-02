import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  CELEBRATION_DURATION_MS,
  CELEBRATION_PRIMARY,
  CELEBRATION_START_DELAY_MS,
} from '@/features/puzzle/completionCelebration';
import { PuzzleCompletionCelebration } from '@/features/puzzle/components/PuzzleCompletionCelebration';

const VOXEL_FRAME = require('../../assets/VOXEL_FRAME_2.png');

/** Source art dimensions (1:1). */
export const VOXEL_FRAME_ART_SIZE = 1007;

/** Transparent opening inset from art pixels (left / top). */
const OPENING_LEFT = 125 / VOXEL_FRAME_ART_SIZE;
const OPENING_TOP = 126 / VOXEL_FRAME_ART_SIZE;
const OPENING_WIDTH = 757 / VOXEL_FRAME_ART_SIZE;
const OPENING_HEIGHT = 755 / VOXEL_FRAME_ART_SIZE;

const BOARD_SCALE_PEAK = 1.03;

interface BoardFrameProps {
  size: number;
  children: React.ReactNode;
  celebrating?: boolean;
}

export const getBoardInnerSize = (frameSize: number): number => {
  const openingWidth = frameSize * OPENING_WIDTH;
  const openingHeight = frameSize * OPENING_HEIGHT;
  return Math.min(openingWidth, openingHeight);
};

export const getBoardOffset = (frameSize: number): { left: number; top: number } => {
  const openingWidth = frameSize * OPENING_WIDTH;
  const openingHeight = frameSize * OPENING_HEIGHT;
  const boardSize = getBoardInnerSize(frameSize);

  return {
    left: frameSize * OPENING_LEFT + (openingWidth - boardSize) / 2,
    top: frameSize * OPENING_TOP + (openingHeight - boardSize) / 2,
  };
};

export const BoardFrame = ({ size, children, celebrating = false }: BoardFrameProps) => {
  const boardSize = getBoardInnerSize(size);
  const { left, top } = getBoardOffset(size);
  const boardCenterX = left + boardSize / 2;
  const boardCenterY = top + boardSize / 2;

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (!celebrating) {
      scale.value = 1;
      glowOpacity.value = 0;
      return;
    }

    const easeOut = Easing.out(Easing.cubic);
    const easeInOut = Easing.inOut(Easing.quad);

    scale.value = withDelay(
      CELEBRATION_START_DELAY_MS,
      withSequence(
        withTiming(BOARD_SCALE_PEAK, { duration: 180, easing: easeOut }),
        withTiming(1, { duration: CELEBRATION_DURATION_MS - 180, easing: easeInOut }),
      ),
    );

    glowOpacity.value = withDelay(
      CELEBRATION_START_DELAY_MS,
      withSequence(
        withTiming(0.55, { duration: 160, easing: easeOut }),
        withTiming(0.28, { duration: 220, easing: easeInOut }),
        withTiming(0, { duration: CELEBRATION_DURATION_MS - 380, easing: easeInOut }),
      ),
    );
  }, [celebrating, glowOpacity, scale]);

  const frameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.root, { width: size, height: size }, frameAnimatedStyle]}>
      <View style={[styles.boardLayer, { left, top, width: boardSize, height: boardSize }]}>
        {children}
      </View>
      <Animated.View
        pointerEvents="none"
        style={[styles.frameGlow, { width: size, height: size }, glowAnimatedStyle]}
      />
      <Image
        pointerEvents="none"
        resizeMode="stretch"
        source={VOXEL_FRAME}
        style={[styles.frameOverlay, { width: size, height: size }]}
      />
      <PuzzleCompletionCelebration
        active={celebrating}
        centerX={boardCenterX}
        centerY={boardCenterY}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  boardLayer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  frameGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: CELEBRATION_PRIMARY,
    shadowColor: CELEBRATION_PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 12,
  },
  frameOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
