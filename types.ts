
export enum CameraStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  RECORDING = 'RECORDING',
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
  settings: {
    brightness: number;
    contrast: number;
    isNightVision: boolean;
  };
}

export type GridLayout = '1x1' | '2x2' | '3x3';

export interface LogEntry {
  timestamp: Date;
  message: string;
  level: 'info' | 'warn' | 'error';
}
