import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { ReactNode } from 'react';
import type { Camera, CameraSettings, LogEntry, Task } from '../types/domain';
import { CameraStatus } from '../types/domain';
import { ConnectionSettings, STORAGE_KEYS, defaultConnectionSettings } from '../config/appConfig';
import { useAuth } from './AuthContext';
import * as apiClient from '../api/client';
import { ApiClientError } from '../api/client';
import {
  CameraRecord,
  PendingMutationRecord,
  TaskRecord,
  MutationType,
  useRealm,
  useQuery,
  persistCameras,
  persistTasks,
  enqueueMutation,
  completeMutation,
  incrementRetry,
  mapCameraRecords,
  mapTaskRecords,
} from '../persistence';
import { captureError, logInfo, logWarn, registerLogListener } from '../utils/logger';
import { useSyncScheduler } from '../hooks/useSyncScheduler';

const parsePayload = <T,>(payload: string): T | null => {
  try {
    return JSON.parse(payload) as T;
  } catch (error) {
    captureError(error, 'Failed to parse mutation payload');
    return null;
  }
};

interface DataContextValue {
  cameras: Camera[];
  tasks: Task[];
  logs: LogEntry[];
  refreshing: boolean;
  refresh: () => Promise<void>;
  toggleFavorite: (cameraId: string) => Promise<void>;
  toggleRecording: (cameraId: string) => Promise<void>;
  updateCameraSettings: (cameraId: string, settings: Partial<CameraSettings>) => Promise<void>;
  connectionSettings: ConnectionSettings;
  updateConnectionSettings: (settings: ConnectionSettings) => Promise<void>;
  isOnline: boolean;
  pendingMutations: number;
  syncingMutations: boolean;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const realm = useRealm();
  const cameraRecords = useQuery(CameraRecord);
  const taskRecords = useQuery(TaskRecord);
  const mutationRecords = useQuery(PendingMutationRecord);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionSettings, setConnectionSettings] = useState<ConnectionSettings>(defaultConnectionSettings);
  const [isOnline, setIsOnline] = useState(true);
  const [syncingMutations, setSyncingMutations] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const processingQueueRef = useRef(false);
  const pendingMutations = mutationRecords.length;

  const shouldQueueMutation = useCallback(
    (error?: unknown) => {
      if (!isOnline) {
        return true;
      }
      if (error instanceof ApiClientError) {
        return error.status >= 500 || error.status === 408 || error.status === 429;
      }
      return true;
    },
    [isOnline]
  );

  const queueMutation = useCallback(
    (type: MutationType, payload: Record<string, unknown>) => {
      enqueueMutation(realm, type, payload);
      logWarn('Queued offline mutation', { type });
    },
    [realm]
  );

  const applyLocalCamera = useCallback(
    (updated: Camera) => {
      setCameras((prev) => prev.map((cam) => (cam.id === updated.id ? updated : cam)));
      persistCameras(realm, [updated]);
    },
    [realm]
  );

  const executeMutation = useCallback(async (record: PendingMutationRecord) => {
    switch (record.type) {
      case 'camera:favorite': {
        const payload = parsePayload<{ cameraId: string; target: boolean }>(record.payload);
        if (!payload) {
          return true;
        }
        await apiClient.toggleFavorite(payload.cameraId, payload.target, payload.target);
        return true;
      }
      case 'camera:recording': {
        const payload = parsePayload<{ cameraId: string; shouldRecord: boolean }>(record.payload);
        if (!payload) {
          return true;
        }
        await apiClient.toggleRecording(payload.cameraId, payload.shouldRecord);
        return true;
      }
      case 'camera:update': {
        const payload = parsePayload<{ cameraId: string; settings: Partial<CameraSettings> }>(record.payload);
        if (!payload) {
          return true;
        }
        await apiClient.updateCameraSettings(payload.cameraId, payload.settings);
        return true;
      }
      case 'task:update': {
        const payload = parsePayload<{ taskId: string; changes: Partial<Task> }>(record.payload);
        if (!payload) {
          return true;
        }
        await apiClient.updateTask(payload.taskId, payload.changes);
        return true;
      }
      default:
        return true;
    }
  }, []);

  const flushMutationQueue = useCallback(async () => {
    if (!token || !isOnline || processingQueueRef.current) {
      return;
    }
    const ordered = Array.from(mutationRecords.sorted('createdAt'));
    if (!ordered.length) {
      return;
    }
    processingQueueRef.current = true;
    setSyncingMutations(true);
    try {
      for (const record of ordered) {
        try {
          const shouldComplete = await executeMutation(record);
          if (shouldComplete) {
            completeMutation(realm, record._id);
          }
        } catch (error) {
          incrementRetry(realm, record._id);
          captureError(error, 'Failed to replay mutation', { mutationId: record._id });
        }
      }
    } finally {
      processingQueueRef.current = false;
      setSyncingMutations(false);
    }
  }, [executeMutation, isOnline, mutationRecords, realm, token]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.CONNECTION).then((value) => {
      if (value) {
        const parsed = JSON.parse(value) as ConnectionSettings;
        setConnectionSettings(parsed);
        apiClient.configureClient({ apiBaseUrl: parsed.apiBaseUrl, wsUrl: parsed.wsUrl });
        logInfo('Restored persisted connection settings', { apiBaseUrl: parsed.apiBaseUrl });
      } else {
        apiClient.configureClient(defaultConnectionSettings);
        logInfo('Using default connection settings', { apiBaseUrl: defaultConnectionSettings.apiBaseUrl });
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.CONNECTION, JSON.stringify(connectionSettings));
    apiClient.configureClient({ apiBaseUrl: connectionSettings.apiBaseUrl, wsUrl: connectionSettings.wsUrl });
    logInfo('Applied new connection settings', { apiBaseUrl: connectionSettings.apiBaseUrl });
  }, [connectionSettings]);

  useEffect(() => {
    const unsubscribe = registerLogListener((event) => {
      setLogs((prev) => [
        { id: event.id, message: event.message, level: event.level, timestamp: event.timestamp },
        ...prev.slice(0, 99),
      ]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setCameras(mapCameraRecords(cameraRecords));
  }, [cameraRecords]);

  useEffect(() => {
    setTasks(mapTaskRecords(taskRecords));
  }, [taskRecords]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const reachable = Boolean(state.isInternetReachable ?? state.isConnected);
      setIsOnline(reachable);
      if (reachable) {
        flushMutationQueue();
      }
    });
    return unsubscribe;
  }, [flushMutationQueue]);

  useEffect(() => {
    if (isOnline && pendingMutations > 0) {
      flushMutationQueue();
    }
  }, [flushMutationQueue, isOnline, pendingMutations]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const handleRealtimeEvent = useCallback((event: any) => {
    switch (event.event) {
      case 'camera_status_update':
      case 'camera_settings_update':
        setCameras((prev) => prev.map((cam) => (cam.id === event.payload.id ? event.payload : cam)));
        persistCameras(realm, [event.payload]);
        break;
      case 'camera_added':
        setCameras((prev) => [...prev.filter((cam) => cam.id !== event.payload.id), event.payload]);
        persistCameras(realm, [event.payload]);
        break;
      case 'camera_removed':
        setCameras((prev) => prev.filter((cam) => cam.id !== event.payload.id));
        break;
      case 'task_created':
        setTasks((prev) => [event.payload, ...prev.filter((task) => task.id !== event.payload.id)]);
        persistTasks(realm, [event.payload]);
        break;
      case 'task_updated':
      case 'task_triggered':
        setTasks((prev) => prev.map((task) => (task.id === event.payload.id ? event.payload : task)));
        persistTasks(realm, [event.payload]);
        break;
      case 'task_deleted':
        setTasks((prev) => prev.filter((task) => task.id !== event.payload.id));
        break;
      case 'log_entry':
        setLogs((prev) => [
          {
            id: `${Date.now()}`,
            message: event.payload.message,
            level: event.payload.level,
            timestamp: event.payload.timestamp ?? new Date().toISOString(),
          },
          ...prev.slice(0, 99),
        ]);
        break;
      default:
        break;
    }
  }, [realm]);

  const attachWebSocket = useCallback(() => {
    if (!token) {
      return;
    }

    const ws = new WebSocket(apiClient.getWebsocketUrl(token));
    ws.onopen = () => logInfo('Realtime telemetry link established');
    ws.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data as string);
        handleRealtimeEvent(payload);
      } catch (error) {
        captureError(error, 'Invalid WS payload');
      }
    };
    ws.onerror = (error) => {
      captureError(error, 'WebSocket error');
    };
    ws.onclose = (event) => {
      logWarn('Realtime telemetry link closed', { code: event.code, reason: event.reason });
      wsRef.current = null;
      if (token) {
        setTimeout(attachWebSocket, 5000);
      }
    };
    wsRef.current = ws;
  }, [handleRealtimeEvent, token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      logInfo('Refreshing camera/task inventory');
      const [fetchedCameras, fetchedTasks] = await Promise.all([apiClient.getCameras() as Promise<Camera[]>, apiClient.getTasks() as Promise<Task[]>]);
      if (fetchedCameras) {
        setCameras(fetchedCameras);
        persistCameras(realm, fetchedCameras);
      }
      if (fetchedTasks) {
        setTasks(fetchedTasks);
        persistTasks(realm, fetchedTasks);
      }
    } catch (error) {
      captureError(error, 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [realm, token]);

  useEffect(() => {
    if (!token) {
      setCameras([]);
      setTasks([]);
      setLogs([]);
      disconnect();
      return;
    }
    refresh();
    attachWebSocket();
    return () => disconnect();
  }, [token, connectionSettings, attachWebSocket, refresh, disconnect]);

  const scheduledJobs = useMemo(
    () => [
      {
        id: 'refresh-snapshot',
        intervalMs: 5 * 60 * 1000,
        action: refresh,
        requiresNetwork: true,
      },
      {
        id: 'flush-mutations',
        intervalMs: 30 * 1000,
        action: flushMutationQueue,
        requiresNetwork: true,
      },
    ],
    [flushMutationQueue, refresh]
  );

  useSyncScheduler(scheduledJobs, { isOnline });

  const toggleFavorite = useCallback(
    async (cameraId: string) => {
      const camera = cameras.find((c) => c.id === cameraId);
      if (!camera) return;
      const nextFavorite = !camera.isFavorite;
      const optimistic = { ...camera, isFavorite: nextFavorite };
      applyLocalCamera(optimistic);
      if (!isOnline) {
        queueMutation('camera:favorite', { cameraId, target: nextFavorite });
        return;
      }
      try {
        logInfo('Toggling favorite flag', { cameraId });
        const updated = await apiClient.toggleFavorite(cameraId, camera.isFavorite, nextFavorite) as Camera;
        applyLocalCamera(updated);
      } catch (error) {
        captureError(error, 'Failed to toggle favorite', { cameraId });
        if (shouldQueueMutation(error)) {
          queueMutation('camera:favorite', { cameraId, target: nextFavorite });
        } else {
          throw error;
        }
      }
    },
    [applyLocalCamera, cameras, isOnline, queueMutation, shouldQueueMutation]
  );

  const toggleRecording = useCallback(
    async (cameraId: string) => {
      const camera = cameras.find((c) => c.id === cameraId);
      if (!camera) return;
      const shouldRecord = camera.status !== CameraStatus.RECORDING;
      const optimistic: Camera = {
        ...camera,
        status: shouldRecord ? CameraStatus.RECORDING : CameraStatus.ONLINE,
      };
      applyLocalCamera(optimistic);
      if (!isOnline) {
        queueMutation('camera:recording', { cameraId, shouldRecord });
        return;
      }
      try {
        logInfo('Toggling recording state', { cameraId });
        const updated = await apiClient.toggleRecording(cameraId, shouldRecord) as Camera;
        applyLocalCamera(updated);
      } catch (error) {
        captureError(error, 'Failed to toggle recording', { cameraId });
        if (shouldQueueMutation(error)) {
          queueMutation('camera:recording', { cameraId, shouldRecord });
        } else {
          throw error;
        }
      }
    },
    [applyLocalCamera, cameras, isOnline, queueMutation, shouldQueueMutation]
  );

  const updateCameraSettings = useCallback(
    async (cameraId: string, settings: Partial<CameraSettings>) => {
      const camera = cameras.find((c) => c.id === cameraId);
      if (camera) {
        const optimistic: Camera = {
          ...camera,
          settings: { ...camera.settings, ...settings },
        };
        applyLocalCamera(optimistic);
      }
      if (!isOnline) {
        queueMutation('camera:update', { cameraId, settings });
        return;
      }
      try {
        logInfo('Updating camera settings', { cameraId });
        const updated = await apiClient.updateCameraSettings(cameraId, settings) as Camera;
        applyLocalCamera(updated);
      } catch (error) {
        captureError(error, 'Failed to update camera settings', { cameraId });
        if (shouldQueueMutation(error)) {
          queueMutation('camera:update', { cameraId, settings });
        } else {
          throw error;
        }
      }
    },
    [applyLocalCamera, cameras, isOnline, queueMutation, shouldQueueMutation]
  );

  const updateConnectionSettings = useCallback(async (settings: ConnectionSettings) => {
    setConnectionSettings(settings);
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      cameras,
      tasks,
      logs,
      refreshing,
      refresh,
      toggleFavorite,
      toggleRecording,
      updateCameraSettings,
      connectionSettings,
      updateConnectionSettings,
      isOnline,
      pendingMutations,
      syncingMutations,
    }),
    [
      cameras,
      tasks,
      logs,
      refreshing,
      refresh,
      toggleFavorite,
      toggleRecording,
      updateCameraSettings,
      connectionSettings,
      updateConnectionSettings,
      isOnline,
      pendingMutations,
      syncingMutations,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
