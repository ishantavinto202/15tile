import { router } from 'expo-router';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GAME_MODES, type GameModeKey } from '@/features/puzzle/types';

const TITLE_HEIGHT = 214;
/** Subtitle + buttons block height from the original centered home layout. */
const ORIGINAL_MODE_BLOCK_HEIGHT = 8 + 16 + 28 + 16 + 58 + 16 + 58;
const ORIGINAL_GROUP_HEIGHT = TITLE_HEIGHT + ORIGINAL_MODE_BLOCK_HEIGHT;
/** Place mode selection around the lower ~65% of the content area. */
const MODE_SECTION_TOP_RATIO = 0.63;

const ModeButton = ({ mode }: { mode: GameModeKey }) => {
  const config = GAME_MODES[mode];

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/game', params: { mode } })}
      style={({ pressed }) => [styles.modeButton, pressed && styles.modeButtonPressed]}
    >
      <Text style={styles.modeButtonText}>{config.title}</Text>
    </Pressable>
  );
};

export default function ModeSelectionScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentHeight = windowHeight - insets.top - insets.bottom;

  const titleTopOffset = (contentHeight - ORIGINAL_GROUP_HEIGHT) / 2;
  const modeSectionTop = contentHeight * MODE_SECTION_TOP_RATIO;
  const modeSectionPaddingTop = Math.max(32, modeSectionTop - titleTopOffset - TITLE_HEIGHT);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.titleContainer, { paddingTop: titleTopOffset }]}>
          <Image resizeMode="contain" source={require('../assets/Title2.png')} style={styles.titleImage} />
        </View>

        <View style={[styles.modeContainer, { paddingTop: modeSectionPaddingTop }]}>
          <View style={styles.modeSelection}>
            <Text style={styles.subtitle}>Choose a mode</Text>
            <ModeButton mode="normal" />
            <ModeButton mode="advanced" />
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
    alignItems: 'center',
    gap: 16,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
  },
  modeButton: {
    width: '100%',
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modeButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  modeButtonText: {
    color: '#eff6ff',
    fontSize: 18,
    fontWeight: '700',
  },
});
