import { Pressable, StyleSheet, Text, View } from 'react-native';

export const BRAND_PRIMARY = '#3F1CEC';
const BRAND_PRIMARY_SELECTED = '#5E4BFF';

interface ModeSelectButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const ModeSelectButton = ({ label, selected, onPress }: ModeSelectButtonProps) => (
  <View style={[styles.button, selected && styles.buttonSelected]}>
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={styles.hitArea}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  button: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 14,
    backgroundColor: BRAND_PRIMARY,
    overflow: 'hidden',
  },
  buttonSelected: {
    backgroundColor: BRAND_PRIMARY_SELECTED,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ scale: 1.02 }],
    shadowColor: BRAND_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  hitArea: {
    width: '100%',
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
