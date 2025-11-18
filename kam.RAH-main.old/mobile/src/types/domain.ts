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
  bitrate: number;
  codec: 'H.264' | 'H.265';
  ptz: {
    enabled: boolean;
    presets: { name: string; value: string }[];
  };
  motionDetection: {
    enabled: boolean;
    sensitivity: number;
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
  url: string;
  previewUrl?: string;
  status: CameraStatus;
  ping: number;
  signal: number;
  lastSeen: string;
  isFavorite: boolean;
  location: string;
  tags: string[];
  settings: CameraSettings;
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'scheduled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskTrigger = 'manual' | 'schedule' | 'event';

export interface TaskSchedule {
  cron?: string;
  timezone?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  triggerType: TaskTrigger;
  schedule?: TaskSchedule;
  targetCameras: string[];
  action: 'record' | 'stopRecord' | 'snapshot' | 'ptz' | 'notify' | 'custom';
  parameters?: Record<string, unknown>;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LogEntry {
  id: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
