import { Image } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { BoardFrame, getBoardInnerSize } from '@/features/puzzle/BoardFrame';

interface AlbumCoverFrameProps {
  size: number;
  imageSource: ImageSourcePropType;
}

export const AlbumCoverFrame = ({ size, imageSource }: AlbumCoverFrameProps) => {
  const openingSize = getBoardInnerSize(size);

  return (
    <BoardFrame size={size}>
      <Image resizeMode="cover" source={imageSource} style={{ width: openingSize, height: openingSize }} />
    </BoardFrame>
  );
};
