import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { Camera } from '../types/domain';
import { StatusBadge } from './StatusBadge';
import { useTranslation } from '../context/LocalizationContext';
import { optimizeMediaUrl } from '../utils/media';

interface Props {
  camera: Camera;
  onPress: () => void;
  onToggleFavorite: () => void;
  onToggleRecording: () => void;
}

export const CameraCard: React.FC<Props> = ({ camera, onPress, onToggleFavorite, onToggleRecording }) => {
  const { t } = useTranslation();
  const optimizedPreview = optimizeMediaUrl(camera.previewUrl);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={camera.name}
      accessibilityHint={t('camera.card.openHint')}
    >
      {optimizedPreview && (
        <Image
          source={{ uri: optimizedPreview }}
          style={styles.preview}
          contentFit="cover"
          cachePolicy="memory-disk"
          accessibilityIgnoresInvertColors
        />
      )}
      <View style={styles.header}>
        <Text style={styles.title}>{camera.name}</Text>
        <StatusBadge status={camera.status} />
      </View>
      <Text style={styles.meta}>{camera.location || t('camera.unassigned')}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={camera.isFavorite ? t('camera.favorite.remove') : t('camera.favorite.add')}
        >
          <Ionicons name={camera.isFavorite ? 'star' : 'star-outline'} size={20} color="#ffd700" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onToggleRecording}
          accessibilityRole="button"
          accessibilityLabel={
            camera.status === 'RECORDING' ? t('camera.record.stop') : t('camera.record.start')
          }
        >
          <Ionicons
            name={camera.status === 'RECORDING' ? 'stop-circle' : 'play-circle'}
            size={24}
            color={camera.status === 'RECORDING' ? '#ff4d4d' : '#00f7ff'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#090b20',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,247,255,0.1)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#040612',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#8288a0',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
});
