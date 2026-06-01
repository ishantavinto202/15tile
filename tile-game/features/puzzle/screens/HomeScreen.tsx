import { router } from 'expo-router';
import { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModeSelectButton } from '@/features/puzzle/components/ModeSelectButton';
import { TimerModeToggle } from '@/features/puzzle/components/TimerModeToggle';
import { timerModeParam } from '@/features/puzzle/modifiers/timerMode';
import { useTimerModePreference } from '@/features/puzzle/modifiers/useTimerModePreference';
import { DEFAULT_MODE, type GameModeKey } from '@/features/puzzle/types';

const TITLE_HEIGHT = 214;
/** Subtitle + mode buttons + timer toggle block height from the original centered home layout. */
const ORIGINAL_MODE_BLOCK_HEIGHT = 8 + 16 + 28 + 16 + 58 + 16 + 58 + 16 + 52;
const ORIGINAL_GROUP_HEIGHT = TITLE_HEIGHT + ORIGINAL_MODE_BLOCK_HEIGHT;
/** Place mode selection around the lower ~65% of the content area. */
const MODE_SECTION_TOP_RATIO = 0.63;

export default function HomeScreen() {
  const { timerModeEnabled, setTimerModeEnabled } = useTimerModePreference();
  const [selectedMode, setSelectedMode] = useState<GameModeKey>(DEFAULT_MODE);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentHeight = windowHeight - insets.top - insets.bottom;

  const titleTopOffset = (contentHeight - ORIGINAL_GROUP_HEIGHT) / 2;
  const modeSectionTop = contentHeight * MODE_SECTION_TOP_RATIO;
  const modeSectionPaddingTop = Math.max(32, modeSectionTop - titleTopOffset - TITLE_HEIGHT);

  const startGame = (mode: GameModeKey) => {
    setSelectedMode(mode);
    router.push({
      pathname: '/game',
      params: { mode, timerMode: timerModeParam(timerModeEnabled) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.titleContainer, { paddingTop: titleTopOffset }]}>
          <Image resizeMode="contain" source={require('../../../assets/Title2.png')} style={styles.titleImage} />
        </View>

        <View style={[styles.modeContainer, { paddingTop: modeSectionPaddingTop }]}>
          <View style={styles.modeSelection}>
            <TimerModeToggle enabled={timerModeEnabled} onValueChange={setTimerModeEnabled} />

            <Text style={styles.subtitle}>Choose a difficulty</Text>

            <ModeSelectButton
              label="8 Tiles"
              onPress={() => startGame('normal')}
              selected={selectedMode === 'normal'}
            />
            <ModeSelectButton
              label="15 Tiles"
              onPress={() => startGame('advanced')}
              selected={selectedMode === 'advanced'}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  modeContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  titleImage: {
    width: 403,
    height: 214,
    alignSelf: 'center',
  },
  modeSelection: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    gap: 16,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
});
