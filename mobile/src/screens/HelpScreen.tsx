import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import { useLocalization, useTranslation } from '../context/LocalizationContext';

export const HelpScreen: React.FC = () => {
  const { connectionSettings, isOnline, pendingMutations, syncingMutations } = useData();
  const { isRTL } = useLocalization();
  const { t } = useTranslation();
  const directionStyle = useMemo(() => ({ textAlign: isRTL ? 'right' : 'left' }), [isRTL]);
  const connectionCopy = isOnline ? t('help.connection.online') : t('help.connection.offline');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.heading, directionStyle]}>{t('help.heading')}</Text>
      <View style={styles.card} accessible accessibilityLabel={`${t('help.connection.title')}: ${connectionCopy}`}>
        <Text style={styles.cardTitle}>{t('help.connection.title')}</Text>
        <Text style={[styles.cardBody, directionStyle]}>{connectionCopy}</Text>
        <Text style={styles.cardFoot}>API: {connectionSettings.apiBaseUrl}</Text>
        <Text style={styles.cardFoot}>WS: {connectionSettings.wsUrl}</Text>
        {!isOnline && (
          <Text style={styles.cardFoot}>
            {t('help.connection.pending', {
              count: pendingMutations,
              state: syncingMutations ? t('offline.syncing') : '',
            })}
          </Text>
        )}
      </View>
      <Text style={[styles.subheading, directionStyle]}>{t('help.quick.title')}</Text>
      <Text style={[styles.listItem, directionStyle]}>• {t('help.quick.dashboard')}</Text>
      <Text style={[styles.listItem, directionStyle]}>• {t('help.quick.logs')}</Text>
      <Text style={[styles.listItem, directionStyle]}>• {t('help.quick.settings')}</Text>
      <Text style={[styles.subheading, directionStyle]}>{t('help.troubleshooting.title')}</Text>
      <Text style={[styles.body, directionStyle]}>1. {t('help.troubleshooting.one')}</Text>
      <Text style={[styles.body, directionStyle]}>2. {t('help.troubleshooting.two')}</Text>
      <Text style={[styles.body, directionStyle]}>3. {t('help.troubleshooting.three')}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050b',
  },
  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#0a0f25',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,247,255,0.3)',
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#78f3ff',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardBody: {
    color: '#d1d4e5',
    marginBottom: 6,
  },
  cardFoot: {
    color: '#7c8ab0',
    fontSize: 12,
  },
  subheading: {
    color: '#00f7ff',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  body: {
    color: '#d1d4e5',
    lineHeight: 20,
    marginBottom: 4,
  },
  listItem: {
    color: '#9aa0bc',
    marginBottom: 6,
  },
});
