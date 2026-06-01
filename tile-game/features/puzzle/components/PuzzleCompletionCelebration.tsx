import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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
  CELEBRATION_GOLD,
  CELEBRATION_PRIMARY,
  CELEBRATION_START_DELAY_MS,
  CELEBRATION_WHITE,
} from '@/features/puzzle/completionCelebration';

const STAR_COUNT = 14;
const STAR_SIZE = 5;
const STAR_TRAVEL = 52;

const STAR_COLORS = [CELEBRATION_PRIMARY, CELEBRATION_GOLD, CELEBRATION_WHITE] as const;

type StarSpec = {
  angle: number;
  distance: number;
  color: (typeof STAR_COLORS)[number];
  size: number;
};

const buildStarSpecs = (): StarSpec[] =>
  Array.from({ length: STAR_COUNT }, (_, index) => {
    const angle = (index / STAR_COUNT) * Math.PI * 2 + (index % 3) * 0.18;
    const distance = STAR_TRAVEL + (index % 4) * 9;
    return {
      angle,
      distance,
      color: STAR_COLORS[index % STAR_COLORS.length],
      size: STAR_SIZE + (index % 2),
    };
  });

interface CelebrationStarProps {
  active: boolean;
  spec: StarSpec;
}

const CelebrationStar = ({ active, spec }: CelebrationStarProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }

    progress.value = withDelay(
      CELEBRATION_START_DELAY_MS,
      withTiming(1, {
        duration: CELEBRATION_DURATION_MS * 0.72,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const travel = spec.distance * progress.value;
    const offsetX = Math.cos(spec.angle) * travel;
    const offsetY = Math.sin(spec.angle) * travel;

    return {
      opacity: 1 - progress.value * 0.92,
      transform: [{ translateX: offsetX }, { translateY: offsetY }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.star,
        animatedStyle,
        {
          width: spec.size,
          height: spec.size,
          backgroundColor: spec.color,
        },
      ]}
    />
  );
};

interface PuzzleCompletionCelebrationProps {
  active: boolean;
  centerX: number;
  centerY: number;
}

const PuzzleCompletionCelebrationComponent = ({
  active,
  centerX,
  centerY,
}: PuzzleCompletionCelebrationProps) => {
  const specs = useMemo(() => buildStarSpecs(), []);

  if (!active) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.burstHost, { left: centerX, top: centerY }]}
    >
      {specs.map((spec, index) => (
        <CelebrationStar key={index} active={active} spec={spec} />
      ))}
    </View>
  );
};

export const PuzzleCompletionCelebration = memo(PuzzleCompletionCelebrationComponent);

const styles = StyleSheet.create({
  burstHost: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  star: {
    position: 'absolute',
    borderRadius: 1,
  },
});
