import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LogEntry } from '../types/domain';
import { formatTimestamp } from '../utils/format';
import { useLocalization, useTranslation } from '../context/LocalizationContext';

export const LogEntryItem: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const colorMap = {
    info: '#00f7ff',
    warn: '#ffce54',
    error: '#ff4d4d',
  } as const;
  const { locale } = useLocalization();
  const { t } = useTranslation();
  const timestamp = formatTimestamp(entry.timestamp, locale) ?? t('format.unknown');
  return (
    <View style={styles.container}>
      <Text style={[styles.level, { color: colorMap[entry.level] }]}>{entry.level.toUpperCase()}</Text>
      <Text style={styles.message}>{entry.message}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1b1f3a',
  },
  level: {
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    color: '#fff',
    marginVertical: 4,
  },
  timestamp: {
    color: '#7c7f93',
    fontSize: 12,
  },
});
