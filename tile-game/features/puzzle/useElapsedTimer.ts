import { useCallback, useEffect, useRef, useState } from 'react';

const pad2 = (n: number) => String(n).padStart(2, '0');

export const formatElapsed = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }
  return `${pad2(m)}:${pad2(s)}`;
};

interface UseElapsedTimerOptions {
  paused: boolean;
  resetKey: string | number;
}

export interface ElapsedTimerState {
  formatted: string;
  seconds: number;
}

export const useElapsedTimer = ({ paused, resetKey }: UseElapsedTimerOptions): ElapsedTimerState => {
  const [seconds, setSeconds] = useState(0);
  const startedAtRef = useRef(Date.now());

  const reset = useCallback(() => {
    startedAtRef.current = Date.now();
    setSeconds(0);
  }, []);

  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  useEffect(() => {
    if (paused) {
      return;
    }

    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [paused, resetKey]);

  return {
    formatted: formatElapsed(seconds),
    seconds,
  };
};
