import { memo, useEffect } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { TILE_MOVE_DURATION_MS } from '@/features/puzzle/completionCelebration';

interface PuzzleTileProps {
  value: number;
  row: number;
  col: number;
  tileSize: number;
  tileSource?: ImageSourcePropType;
  disabled?: boolean;
  onPress: (value: number) => void;
}

const ANIMATION_DURATION = TILE_MOVE_DURATION_MS;
const BADGE_SIZE = 24;
const BADGE_TEXT_BOX = 18;

const PuzzleTileComponent = ({
  value,
  row,
  col,
  tileSize,
  tileSource,
  disabled = false,
  onPress,
}: PuzzleTileProps) => {
  const x = useSharedValue(col * tileSize);
  const y = useSharedValue(row * tileSize);

  useEffect(() => {
    x.value = withTiming(col * tileSize, { duration: ANIMATION_DURATION });
    y.value = withTiming(row * tileSize, { duration: ANIMATION_DURATION });
  }, [col, row, tileSize, x, y]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, animatedStyle, { width: tileSize, height: tileSize }]}>
      <Pressable
        disabled={disabled}
        onPress={() => onPress(value)}
        style={({ pressed }) => [
          styles.tile,
          { width: tileSize, height: tileSize },
          disabled && styles.disabledTile,
          pressed && !disabled && styles.tilePressed,
        ]}
      >
        {tileSource ? (
          <Image source={tileSource} style={[styles.tileImage, { width: tileSize, height: tileSize }]} />
        ) : (
          <View style={styles.tileFallback} />
        )}
        <View style={styles.numberBadge}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.45}
            numberOfLines={1}
            style={styles.number}
          >
            {value}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const PuzzleTile = memo(PuzzleTileComponent);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  tile: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: '#000000',
  },
  disabledTile: {
    opacity: 0.9,
  },
  tilePressed: {
    opacity: 0.8,
  },
  tileImage: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  tileFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
  },
  numberBadge: {
    margin: 6,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  number: {
    width: BADGE_TEXT_BOX,
    height: BADGE_TEXT_BOX,
    color: '#000000',
    fontWeight: '700',
    fontSize: 11,
    lineHeight: BADGE_TEXT_BOX,
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
  },
});
