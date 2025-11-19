import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, AccessibilityInfo, findNodeHandle } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useData } from '../context/DataContext';
import type { DashboardStackParamList } from '../navigation/AppNavigator';
import { NeonButton } from '../components/NeonButton';
import { StatusBadge } from '../components/StatusBadge';
import { formatLatency } from '../utils/format';
import { useLocalization, useTranslation } from '../context/LocalizationContext';

type Route = RouteProp<DashboardStackParamList, 'CameraDetail'>;

export const CameraDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const { cameras, toggleFavorite, toggleRecording, isOnline, pendingMutations } = useData();
  const camera = useMemo(() => cameras.find((c) => c.id === route.params.cameraId), [cameras, route.params.cameraId]);
  const { locale, isRTL } = useLocalization();
  const { t } = useTranslation();
  const directionStyle = useMemo(() => ({ textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right' }), [isRTL]);
  const headingRef = useRef<Text | null>(null);

  useEffect(() => {
    if (camera && headingRef.current) {
      const target = findNodeHandle(headingRef.current);
      if (target) {
        AccessibilityInfo.setAccessibilityFocus(target);
      }
    }
  }, [camera]);

  if (!camera) {
    return (
      <View style={styles.container}>
        <Text style={[styles.empty, directionStyle]}>{t('camera.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={[styles.title, directionStyle]} ref={headingRef} accessibilityRole="header">
          {camera.name}
        </Text>
        <StatusBadge status={camera.status} />
      </View>
      <Text style={[styles.meta, directionStyle]}>
        {t('camera.location')}: {camera.location || t('camera.unassigned')}
      </Text>
      <Text style={[styles.meta, directionStyle]}>
        {t('camera.ping')}: {(() => {
          const latencyNumber = formatLatency(camera.ping, locale);
          return latencyNumber ? t('format.latency', { value: latencyNumber }) : t('format.notAvailable');
        })()}
      </Text>
      <Text style={[styles.meta, directionStyle]}>
        {t('camera.signal')}: {camera.signal > 0 ? `${camera.signal}%` : t('format.notAvailable')}
      </Text>

      <View style={styles.buttons}>
        <NeonButton
          title={camera.isFavorite ? t('camera.favorite.remove') : t('camera.favorite.add')}
          onPress={() => toggleFavorite(camera.id)}
        />
        <NeonButton
          title={camera.status === 'RECORDING' ? t('camera.record.stop') : t('camera.record.start')}
          onPress={() => toggleRecording(camera.id)}
          variant="secondary"
        />
      </View>
      {!isOnline && (
        <Text style={[styles.offlineNote, directionStyle]}>
          {t('camera.offlineQueue', { count: pendingMutations })}
        </Text>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, directionStyle]}>{t('camera.settings.streamTitle')}</Text>
        <Text style={[styles.sectionItem, directionStyle]}>
          {t('camera.settings.resolution')}: {camera.settings.resolution}
        </Text>
        <Text style={[styles.sectionItem, directionStyle]}>
          {t('camera.settings.codec')}: {camera.settings.codec}
        </Text>
        <Text style={[styles.sectionItem, directionStyle]}>
          {t('camera.settings.fps')}: {camera.settings.fps}
        </Text>
        <Text style={[styles.sectionItem, directionStyle]}>
          {t('camera.settings.bitrate')}: {camera.settings.bitrate} kbps
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, directionStyle]}>{t('camera.settings.recordingTitle')}</Text>
        <Text style={[styles.sectionItem, directionStyle]}>
          {t('camera.settings.mode')}: {camera.settings.recording.mode}
        </Text>
        <Text style={[styles.sectionItem, directionStyle]}>
          {t('camera.settings.retention')}: {camera.settings.recording.retentionDays} {t('common.days')}
        </Text>
        <Text style={[styles.sectionItem, directionStyle]}>
          {t('camera.settings.motion')}:{' '}
          {camera.settings.motionDetection.enabled ? t('common.enabled') : t('common.disabled')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050b',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  meta: {
    color: '#9aa0bc',
    marginTop: 4,
  },
  buttons: {
    marginVertical: 16,
    gap: 10,
  },
  section: {
    backgroundColor: '#0a0f25',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,247,255,0.1)',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#00f7ff',
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionItem: {
    color: '#fff',
    marginBottom: 4,
  },
  empty: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
  offlineNote: {
    color: '#ff8b5f',
    marginBottom: 16,
    textTransform: 'uppercase',
    fontSize: 12,
  },
});
