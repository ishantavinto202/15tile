import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { TIMER_MODE_STORAGE_KEY } from '@/features/puzzle/modifiers/timerMode';

export const useTimerModePreference = () => {
  const [enabled, setEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(TIMER_MODE_STORAGE_KEY);
        if (!cancelled && stored !== null) {
          setEnabled(stored === '1');
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      void AsyncStorage.setItem(TIMER_MODE_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  const setTimerModeEnabled = useCallback((next: boolean) => {
    setEnabled(next);
    void AsyncStorage.setItem(TIMER_MODE_STORAGE_KEY, next ? '1' : '0');
  }, []);

  return {
    timerModeEnabled: enabled,
    timerModeHydrated: hydrated,
    toggleTimerMode: toggle,
    setTimerModeEnabled,
  };
};
