import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TimeUpPanelProps {
  moves: number;
  progressPercent: number;
  onRetry: () => void;
}

export const TimeUpPanel = ({ moves, progressPercent, onRetry }: TimeUpPanelProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Time Up!</Text>
    <Text style={styles.statLine}>Total Moves: {moves}</Text>
    <Text style={styles.statLine}>Progress: {progressPercent}% Completed</Text>
    <View style={styles.actions}>
      <Pressable onPress={onRetry} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Retry</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/')} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 88,
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    color: '#f87171',
    fontWeight: '800',
    fontSize: 22,
    textAlign: 'center',
  },
  statLine: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    marginTop: 10,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#eff6ff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 16,
  },
});
