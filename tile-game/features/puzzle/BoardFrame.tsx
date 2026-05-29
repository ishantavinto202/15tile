import { Image, StyleSheet, View } from 'react-native';

const VOXEL_FRAME = require('../../assets/VOXEL_FRAME.png');

/** Source art dimensions (1:1). */
export const VOXEL_FRAME_ART_SIZE = 1007;

/** Transparent opening inset from art pixels (left / top). */
const OPENING_LEFT = 125 / VOXEL_FRAME_ART_SIZE;
const OPENING_TOP = 126 / VOXEL_FRAME_ART_SIZE;
const OPENING_WIDTH = 757 / VOXEL_FRAME_ART_SIZE;
const OPENING_HEIGHT = 755 / VOXEL_FRAME_ART_SIZE;

interface BoardFrameProps {
  size: number;
  children: React.ReactNode;
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

export const BoardFrame = ({ size, children }: BoardFrameProps) => {
  const boardSize = getBoardInnerSize(size);
  const { left, top } = getBoardOffset(size);

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.boardLayer, { left, top, width: boardSize, height: boardSize }]}>
        {children}
      </View>
      <Image
        pointerEvents="none"
        resizeMode="stretch"
        source={VOXEL_FRAME}
        style={[styles.frameOverlay, { width: size, height: size }]}
      />
    </View>
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
  frameOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
