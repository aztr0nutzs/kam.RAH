
export enum CameraStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  RECORDING = 'RECORDING',
}

export interface CameraSettings {
  brightness: number;
  contrast: number;
  isNightVision: boolean;
  resolution: '1080p' | '720p' | '480p';
  fps: number;
  bitrate: number; // in kbps
  codec: 'H.264' | 'H.265';
  ptz: {
    enabled: boolean;
    presets: { name: string; value: string }[];
  };
  motionDetection: {
    enabled: boolean;
    sensitivity: number; // 0-100
  };
  recording: {
    mode: 'continuous' | 'motion' | 'schedule' | 'off';
    retentionDays: number;
  };
}

export interface Camera {
  id: string;
  name: string;
  type: 'IP' | 'USB' | 'Android';
  url: string; // HLS/WebRTC stream URL
  status: CameraStatus;
  ping: number;
  signal: number;
  lastSeen: string;
  isFavorite: boolean;
  location: string;
  tags: string[];
  settings: CameraSettings;
}

export type GridLayout = '1x1' | '2x2' | '3x3';

export interface LogEntry {
  timestamp: Date;
  message: string;
  level: 'info' | 'warn' | 'error';
}

export interface Notification {
  id: number;
  message: string;
  level: 'info' | 'success' | 'error';
}
