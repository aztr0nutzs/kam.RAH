import React, { useEffect } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { useTranslation } from '../context/LocalizationContext';

interface OfflineBannerProps {
  pendingMutations: number;
  syncingMutations: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ pendingMutations, syncingMutations }) => {
  const { t } = useTranslation();
  const showQueue = pendingMutations > 0;
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(t('offline.title'));
  }, [t]);
  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.title}>{t('offline.title')}</Text>
      <Text style={styles.subtitle}>
        {showQueue
          ? t('offline.queue', {
              count: pendingMutations,
              state: syncingMutations ? t('offline.syncing') : '',
            })
          : t('offline.description')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2b1b4f',
    borderColor: '#ff8b5f',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 12,
    borderRadius: 8,
  },
  title: {
    color: '#ff8b5f',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#f5f5f5',
    fontSize: 12,
  },
});
