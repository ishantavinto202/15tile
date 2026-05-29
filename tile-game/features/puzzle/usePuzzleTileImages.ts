import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';

type TileSourceMap = Record<number, ImageSourcePropType>;

interface UsePuzzleTileImagesResult {
  tileSources: TileSourceMap;
  loading: boolean;
}

export const usePuzzleTileImages = (
  imageSource: ImageSourcePropType,
  gridSize: number,
): UsePuzzleTileImagesResult => {
  const [tileSources, setTileSources] = useState<TileSourceMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const sliceImage = async () => {
      setLoading(true);

      const resolved = Image.resolveAssetSource(imageSource);
      const sourceUri = resolved?.uri;
      const sourceWidth = resolved?.width ?? 0;
      const sourceHeight = resolved?.height ?? 0;
      const sourceSize = Math.min(sourceWidth, sourceHeight);

      if (!sourceUri || sourceSize <= 0) {
        if (!cancelled) {
          setTileSources({});
          setLoading(false);
        }
        return;
      }

      const step = sourceSize / gridSize;
      const tilePromises: Array<Promise<[number, ImageSourcePropType]>> = [];

      for (let value = 1; value < gridSize * gridSize; value += 1) {
        const solvedIndex = value - 1;
        const row = Math.floor(solvedIndex / gridSize);
        const col = solvedIndex % gridSize;
        const originX = col * step;
        const originY = row * step;
        const width = col === gridSize - 1 ? sourceSize - originX : step;
        const height = row === gridSize - 1 ? sourceSize - originY : step;

        tilePromises.push(
          manipulateAsync(
            sourceUri,
            [{ crop: { originX, originY, width, height } }],
            { compress: 1, format: SaveFormat.PNG },
          ).then((result) => [value, { uri: result.uri }] as [number, ImageSourcePropType]),
        );
      }

      const entries = await Promise.all(tilePromises);

      if (!cancelled) {
        setTileSources(Object.fromEntries(entries));
        setLoading(false);
      }
    };

    sliceImage();

    return () => {
      cancelled = true;
    };
  }, [imageSource, gridSize]);

  return { tileSources, loading };
};
