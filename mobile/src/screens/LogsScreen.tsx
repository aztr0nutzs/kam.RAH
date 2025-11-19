import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useData } from '../context/DataContext';
import { LogEntryItem } from '../components/LogEntryItem';
import { useLocalization, useTranslation } from '../context/LocalizationContext';

export const LogsScreen: React.FC = () => {
  const { logs } = useData();
  const { isRTL } = useLocalization();
  const { t } = useTranslation();
  const directionStyle = useMemo(() => ({ textAlign: isRTL ? 'right' : 'left' }), [isRTL]);

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, directionStyle]}>{t('logs.heading')}</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogEntryItem entry={item} />}
        ListEmptyComponent={<Text style={[styles.empty, directionStyle]}>{t('logs.empty')}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050b',
    padding: 16,
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});
