import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraStatus } from '../types/domain';
import { useTranslation } from '../context/LocalizationContext';

export const StatusBadge: React.FC<{ status: CameraStatus }> = ({ status }) => {
  const colorMap: Record<CameraStatus, string> = {
    ONLINE: '#00f7ff',
    OFFLINE: '#888',
    RECORDING: '#ff4d4d',
  };
  const { t } = useTranslation();
  const labelMap: Record<CameraStatus, string> = {
    ONLINE: t('status.online'),
    OFFLINE: t('status.offline'),
    RECORDING: t('status.recording'),
  };

  return (
    <View
      style={[styles.badge, { borderColor: colorMap[status] }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={labelMap[status]}
    >
      <Text style={[styles.text, { color: colorMap[status] }]}>{labelMap[status]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
