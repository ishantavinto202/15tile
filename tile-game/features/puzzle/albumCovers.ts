import type { ImageSourcePropType } from 'react-native';

/** All album covers available for puzzle generation. */
export const ALBUM_COVER_POOL: readonly ImageSourcePropType[] = [
  require('../../assets/Beatles.png'),
  require('../../assets/Doors.png'),
  require('../../assets/RHCP.png'),
  require('../../assets/TameImpala.png'),
];

let lastAlbumCoverIndex = -1;

export const getAlbumCoverIndex = (source: ImageSourcePropType): number => {
  const index = ALBUM_COVER_POOL.indexOf(source);
  return index >= 0 ? index : 0;
};

export const getAlbumCoverByIndex = (index: number): ImageSourcePropType => {
  const normalized = Number.isFinite(index) ? Math.floor(index) : 0;
  return ALBUM_COVER_POOL[normalized] ?? ALBUM_COVER_POOL[0];
};

/** Picks a random album cover, avoiding the previous pool index when possible. */
export const pickRandomAlbumCover = (current?: ImageSourcePropType): ImageSourcePropType => {
  const pool = ALBUM_COVER_POOL;
  let indices = pool.map((_, index) => index);

  if (pool.length > 1 && lastAlbumCoverIndex >= 0) {
    indices = indices.filter((index) => index !== lastAlbumCoverIndex);
  }

  if (current && pool.length > 1) {
    const currentIndex = pool.indexOf(current);
    if (currentIndex >= 0) {
      indices = indices.filter((index) => index !== currentIndex);
    }
  }

  if (indices.length === 0) {
    indices = pool.map((_, index) => index);
  }

  const pickedIndex = indices[Math.floor(Math.random() * indices.length)] ?? 0;
  lastAlbumCoverIndex = pickedIndex;
  return pool[pickedIndex];
};
