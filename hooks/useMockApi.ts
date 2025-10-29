import { useState, useEffect } from 'react';
import type { Camera, Notification } from '../types';
import { CameraStatus } from '../types';

// P1-1: Minimal mock API implementation

const mockCameras: Camera[] = [
  {
    id: 'mock1',
    name: 'Mock Cam 1 (Lobby)',
    type: 'IP',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: CameraStatus.ONLINE,
    ping: 22,
    signal: 95,
    lastSeen: new Date().toISOString(),
    isFavorite: true,
    location: 'Lobby',
    tags: ['indoor', 'mock'],
    settings: {
      brightness: 100,
      contrast: 100,
      isNightVision: false,
      resolution: '1080p',
      fps: 30,
      bitrate: 4096,
      codec: 'H.264',
      ptz: {
        enabled: true,
        presets: [{ name: 'Desk', value: '1' }, { name: 'Door', value: '2' }],
      },
      motionDetection: {
        enabled: true,
        sensitivity: 80,
      },
      recording: {
        mode: 'motion',
        retentionDays: 30,
      },
    },
  },
  {
    id: 'mock2',
    name: 'Mock Cam 2 (Offline)',
    type: 'IP',
    url: 'invalid.stream.url',
    status: CameraStatus.OFFLINE,
    ping: -1,
    signal: -1,
    lastSeen: new Date(Date.now() - 86400000).toISOString(),
    isFavorite: false,
    location: 'Parking Lot',
    tags: ['outdoor', 'mock'],
     settings: {
      brightness: 100,
      contrast: 100,
      isNightVision: false,
      resolution: '720p',
      fps: 15,
      bitrate: 2048,
      codec: 'H.264',
      ptz: {
        enabled: false,
        presets: [],
      },
      motionDetection: {
        enabled: false,
        sensitivity: 50,
      },
      recording: {
        mode: 'off',
        retentionDays: 7,
      },
    },
  }
];


export const useMockApi = (addNotification: (message: string, level: Notification['level']) => void) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const addLog = (log: any) => setLogs(prev => [log, ...prev.slice(0, 99)]);

  useEffect(() => {
    addLog({ message: 'Initializing system... (MOCK MODE)', level: 'warn' });
    setTimeout(() => {
        setCameras(mockCameras);
        addLog({ message: `Found ${mockCameras.length} mock devices.`, level: 'info' });
    }, 500);
  }, []);

  const updateCamera = (updatedCamera: Camera) => {
    setCameras(prev => prev.map(c => c.id === updatedCamera.id ? updatedCamera : c));
    addLog({ message: `(Mock) Settings updated for '${updatedCamera.name}'.`, level: 'info' });
  };
  
  const toggleRecording = (cameraId: string) => {
    setCameras(prev => prev.map(c => {
        if (c.id === cameraId) {
            const isRecording = c.status === CameraStatus.RECORDING;
            const newStatus = isRecording ? CameraStatus.ONLINE : CameraStatus.RECORDING;
            addLog({ message: `(Mock) Toggled recording ${newStatus} for '${c.name}'.`, level: 'info' });
            return { ...c, status: newStatus };
        }
        return c;
    }));
  };
  
  const setCameraOffline = (cameraId: string) => {
     setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, status: CameraStatus.OFFLINE } : c));
     addLog({ message: `(Mock) Stream error, set '${cameraId}' to OFFLINE.`, level: 'warn' });
  };
  
  // Return an object matching the real useApi hook's interface
  return { 
    cameras, 
    logs, 
    updateCamera, 
    toggleRecording, 
    setCameraOffline,
    addCamera: () => addNotification('Add camera is not mocked.', 'info'),
    toggleFavorite: () => addNotification('Toggle favorite is not mocked.', 'info'),
    startAllRecording: () => addNotification('Start all is not mocked.', 'info'),
    stopAllRecording: () => addNotification('Stop all is not mocked.', 'info'),
  };
};