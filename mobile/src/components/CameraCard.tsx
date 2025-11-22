
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraStatus } from '../types/domain';
import { colors, typography, shadow } from '../theme/theme';

interface CameraCardProps {
  camera: Camera;
  isSelected: boolean;
  onSelect: (camera: Camera) => void;
  onToggleRecording: (id: string) => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, isSelected, onSelect, onToggleRecording }) => {
  const isOnline = camera.status !== CameraStatus.OFFLINE;

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isSelected && styles.selectedContainer
      ]}
      onPress={() => onSelect(camera)}
      activeOpacity={0.9}
    >
      {isOnline ? (
        <Video
          source={{ uri: camera.url }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isOnline}
          isMuted={true}
          onError={(e) => console.log('Video Error', e)}
        />
      ) : (
        <View style={[styles.video, styles.offlineContainer]}>
          <Ionicons name="cloud-offline" size={40} color={colors.danger} />
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      )}

      {/* Overlay Info */}
      <View style={styles.overlayTop}>
        <Text style={styles.cameraName} numberOfLines={1}>{camera.name}</Text>
        {camera.status === CameraStatus.RECORDING && (
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>REC</Text>
          </View>
        )}
      </View>

      {/* Overlay Controls */}
      <View style={styles.overlayBottom}>
         <TouchableOpacity onPress={() => onToggleRecording(camera.id)}>
            <Ionicons 
              name={camera.status === CameraStatus.RECORDING ? "stop-circle-outline" : "radio-button-on"} 
              size={24} 
              color={camera.status === CameraStatus.RECORDING ? colors.neonPink : colors.textPrimary} 
            />
         </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
    aspectRatio: 16/9,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  selectedContainer: {
    borderColor: colors.neonCyan,
    borderWidth: 2,
    ...shadow.neonCyan,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  offlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  offlineText: {
    color: colors.danger,
    fontFamily: typography.orbitron,
    marginTop: 8,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cameraName: {
    color: colors.textPrimary,
    fontFamily: typography.monospace,
    fontSize: 12,
    fontWeight: 'bold',
    maxWidth: '70%',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.6)',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 4,
  },
  recText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 6,
  }
});
