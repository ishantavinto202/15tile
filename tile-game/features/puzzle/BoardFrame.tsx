import type { ImageSourcePropType } from 'react-native';
import { ImageBackground, StyleSheet, View } from 'react-native';

interface BoardFrameProps {
  size: number;
  children: React.ReactNode;
  frameSource?: ImageSourcePropType;
}

const FRAME_PADDING = 12;
const BORDER_RADIUS = 22;

export const BoardFrame = ({ size, children, frameSource }: BoardFrameProps) => {
  const contentSize = size - FRAME_PADDING * 2;

  if (frameSource) {
    return (
      <ImageBackground
        resizeMode="stretch"
        source={frameSource}
        style={[styles.frame, { width: size, height: size }]}
      >
        <View style={[styles.innerClip, { width: contentSize, height: contentSize }]}>
          {children}
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View style={[styles.innerClip, { width: contentSize, height: contentSize }]}>{children}</View>
    </View>
  );
};

export const getBoardInnerSize = (frameSize: number) => frameSize - FRAME_PADDING * 2;

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  innerClip: {
    borderRadius: BORDER_RADIUS - 8,
    overflow: 'hidden',
    backgroundColor: '#111625',
  },
});
