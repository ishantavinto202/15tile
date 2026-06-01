import { useCallback, useEffect, useRef, useState } from 'react';

import { formatElapsed } from '@/features/puzzle/useElapsedTimer';

interface UseCountdownTimerOptions {
  durationSeconds: number;
  paused: boolean;
  resetKey: string | number;
  onExpire?: () => void;
}

export interface CountdownTimerState {
  formatted: string;
  remainingSeconds: number;
  elapsedSeconds: number;
  expired: boolean;
}

export const useCountdownTimer = ({
  durationSeconds,
  paused,
  resetKey,
  onExpire,
}: UseCountdownTimerOptions): CountdownTimerState => {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [expired, setExpired] = useState(false);
  const endsAtRef = useRef(Date.now() + durationSeconds * 1000);
  const didExpireRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const reset = useCallback(() => {
    endsAtRef.current = Date.now() + durationSeconds * 1000;
    didExpireRef.current = false;
    setRemainingSeconds(durationSeconds);
    setExpired(false);
  }, [durationSeconds]);

  useEffect(() => {
    reset();
  }, [durationSeconds, resetKey, reset]);

  useEffect(() => {
    if (paused || expired) {
      return;
    }

    const tick = () => {
      const nextRemaining = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0 && !didExpireRef.current) {
        didExpireRef.current = true;
        setExpired(true);
        onExpireRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 250);

    return () => clearInterval(id);
  }, [expired, paused, resetKey]);

  const elapsedSeconds = Math.min(durationSeconds, durationSeconds - remainingSeconds);

  return {
    formatted: formatElapsed(remainingSeconds),
    remainingSeconds,
    elapsedSeconds,
    expired,
  };
};
