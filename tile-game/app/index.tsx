import { router } from 'expo-router';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { GAME_MODES, type GameModeKey } from '@/features/puzzle/types';

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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image resizeMode="contain" source={require('../assets/Title2.png')} style={styles.titleImage} />
        <Text style={styles.subtitle}>Choose a mode</Text>

        <View style={styles.modeList}>
          <ModeButton mode="normal" />
          <ModeButton mode="advanced" />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleImage: {
    width: 403,
    height: 214,
    alignSelf: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  modeList: {
    width: '100%',
    maxWidth: 340,
    gap: 16,
    alignItems: 'center',
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
