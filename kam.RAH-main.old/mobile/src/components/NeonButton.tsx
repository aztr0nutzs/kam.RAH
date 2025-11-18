import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

interface Props {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary';
}

export const NeonButton: React.FC<Props> = ({ title, onPress, variant = 'primary' }) => (
  <TouchableOpacity
    style={[styles.button, variant === 'secondary' && styles.secondary]}
    onPress={onPress}
    activeOpacity={0.9}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00f7ff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 6,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00f7ff',
  },
  text: {
    color: '#000',
    fontWeight: '700',
  },
  secondaryText: {
    color: '#00f7ff',
  },
});
