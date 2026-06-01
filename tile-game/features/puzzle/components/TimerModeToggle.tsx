import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

const TIMER_MODE_ACTIVE_COLOR = '#3F1CEC';

interface TimerModeToggleProps {
  enabled: boolean;
  onValueChange: (enabled: boolean) => void;
}

export const TimerModeToggle = ({ enabled, onValueChange }: TimerModeToggleProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>Timer Mode</Text>
    <Switch
      accessibilityLabel="Timer Mode"
      accessibilityRole="switch"
      onValueChange={onValueChange}
      trackColor={
        Platform.OS === 'ios'
          ? { true: TIMER_MODE_ACTIVE_COLOR }
          : { false: '#475569', true: TIMER_MODE_ACTIVE_COLOR }
      }
      value={enabled}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 4,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: '700',
  },
});
