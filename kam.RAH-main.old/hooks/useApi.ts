import { useState, useEffect, useCallback, useRef } from 'react';
import type { Camera, LogEntry, Notification, Task } from '../types';
import { CameraStatus } from '../types';
import * as apiClient from '../lib/apiClient';
import { ApiError } from '../lib/apiClient';
import { appConfig } from '../config/appConfig';

interface UseApiOptions {
  enabled?: boolean;
  token?: string | null;
}

export const useApi = (
  addNotification: (message: string, level: Notification['level']) => void,
  options: UseApiOptions = {}
) => {
  const { enabled = true, token = null } = options;
  const requireAuth = appConfig.REQUIRE_AUTH;
  const canOperate = enabled && (!requireAuth || Boolean(token));

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = useCallback((log: Omit<LogEntry, 'timestamp'> & { timestamp?: Date | string }) => {
    const newLog = { ...log, timestamp: new Date(log.timestamp || new Date()) };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  }, []);

  const handleApiError = useCallback(
    (error: unknown, contextMessage: string) => {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error(`${contextMessage}:`, error);
      addLog({ message: `${contextMessage}: ${errorMessage}`, level: 'error' });
      addNotification(`${contextMessage}: ${errorMessage}`, 'error');
    },
    [addLog, addNotification]
  );

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const setupWebSocket = useCallback(() => {
    if (!canOperate) {
      return;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl = new URL(appConfig.WS_URL);
    if (token) {
      wsUrl.searchParams.set('token', token);
    }

    wsRef.current = new WebSocket(wsUrl.toString());

    wsRef.current.onopen = () => {
      addLog({ message: 'Real-time link to command server established.', level: 'info' });
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.event) {
          case 'camera_status_update':
          case 'camera_settings_update':
            setCameras((prev) => prev.map((cam) => (cam.id === data.payload.id ? data.payload : cam)));
            break;
          case 'camera_added':
            setCameras((prev) => [...prev.filter((cam) => cam.id !== data.payload.id), data.payload]);
            addNotification(`New camera added: ${data.payload.name}`, 'success');
            break;
          case 'camera_removed':
            setCameras((prev) => prev.filter((cam) => cam.id !== data.payload.id));
            addNotification('Camera removed from grid.', 'info');
            break;
          case 'task_created':
            setTasks((prev) => [data.payload, ...prev.filter((task) => task.id !== data.payload.id)]);
            break;
          case 'task_updated':
          case 'task_triggered':
            setTasks((prev) => prev.map((task) => (task.id === data.payload.id ? data.payload : task)));
            break;
          case 'task_deleted':
            setTasks((prev) => prev.filter((task) => task.id !== data.payload.id));
            break;
          case 'log_entry':
            addLog({
              message: data.payload.message,
              level: data.payload.level,
              timestamp: data.payload.timestamp,
            });
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        addLog({ message: 'Received invalid WebSocket message.', level: 'error' });
      }
    };

    wsRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    wsRef.current.onclose = (event) => {
      wsRef.current = null;
      if (!canOperate) {
        return;
      }
      let reason = 'Connection closed unexpectedly.';
      if (event.code === 1006) {
        reason = 'Connection aborted. Please check the server status.';
      } else if (event.reason) {
        reason = event.reason;
      }
      addLog({ message: `WebSocket: ${reason}`, level: 'warn' });
      addNotification('Connection to server lost. Retrying...', 'error');
      reconnectTimerRef.current = setTimeout(setupWebSocket, 5000);
    };
  }, [addLog, addNotification, canOperate, token]);

  useEffect(() => {
    let isMounted = true;

    if (!canOperate) {
      setCameras([]);
      setTasks([]);
      setLogs([]);
      disconnect();
      return () => {
        isMounted = false;
      };
    }

    const loadInitialData = async () => {
      try {
        addLog({ message: 'Initializing system... Contacting command server.', level: 'info' });
        const [initialCameras, initialTasks] = await Promise.all([
          apiClient.getCameras(),
          apiClient.getTasks(),
        ]);

        if (isMounted) {
          setCameras(initialCameras || []);
          setTasks(initialTasks || []);
          addLog({
            message: `Synchronized ${initialCameras?.length ?? 0} cameras and ${initialTasks?.length ?? 0} tasks.`,
            level: 'info',
          });
        }
      } catch (error) {
        handleApiError(error, 'Failed to connect to server');
      }
    };

    loadInitialData();
    setupWebSocket();

    return () => {
      isMounted = false;
      disconnect();
    };
  }, [canOperate, disconnect, handleApiError, setupWebSocket, addLog]);

  const updateCamera = useCallback(
    async (updatedCamera: Camera) => {
      try {
        const response = await apiClient.updateCameraSettings(updatedCamera.id, updatedCamera.settings);
        setCameras((prev) => prev.map((cam) => (cam.id === response.id ? response : cam)));
        addLog({ message: `Settings updated for '${response.name}'.`, level: 'info' });
      } catch (error) {
        handleApiError(error, `Failed to update settings for ${updatedCamera.name}`);
      }
    },
    [addLog, handleApiError]
  );

  const toggleRecording = useCallback(
    async (cameraId: string) => {
      try {
        const cam = cameras.find((c) => c.id === cameraId);
        if (!cam) return;
        const shouldRecord = cam.status !== CameraStatus.RECORDING;
        const response = await apiClient.toggleRecording(cameraId, shouldRecord);
        setCameras((prev) => prev.map((c) => (c.id === response.id ? response : c)));
        addLog({ message: `Recording ${shouldRecord ? 'started' : 'stopped'} for '${cam.name}'.`, level: 'info' });
      } catch (error) {
        handleApiError(error, 'Failed to toggle recording');
      }
    },
    [cameras, addLog, handleApiError]
  );

  const toggleFavorite = useCallback(
    async (cameraId: string) => {
      try {
        const cam = cameras.find((c) => c.id === cameraId);
        if (!cam) return;
        const updatedCamera = await apiClient.toggleFavorite(cameraId, cam.isFavorite);
        setCameras((prev) => prev.map((c) => (c.id === updatedCamera.id ? updatedCamera : c)));
        addLog({ message: `'${updatedCamera.name}' favorite status updated.`, level: 'info' });
      } catch (error) {
        handleApiError(error, 'Failed to update favorites');
      }
    },
    [cameras, addLog, handleApiError]
  );

  const startAllRecording = useCallback(async () => {
    addLog({ message: 'Sending command: start recording on all cameras.', level: 'info' });
    const promises = cameras
      .filter((cam) => cam.status === CameraStatus.ONLINE)
      .map((cam) => apiClient.toggleRecording(cam.id, true));
    try {
      await Promise.all(promises);
      addNotification('Started recording on all online cameras.', 'info');
    } catch (error) {
      handleApiError(error, 'Failed to start all recordings');
    }
  }, [cameras, addNotification, handleApiError, addLog]);

  const stopAllRecording = useCallback(async () => {
    addLog({ message: 'Sending command: stop recording on all cameras.', level: 'info' });
    const promises = cameras
      .filter((cam) => cam.status === CameraStatus.RECORDING)
      .map((cam) => apiClient.toggleRecording(cam.id, false));
    try {
      await Promise.all(promises);
      addNotification('Stopped recording on all cameras.', 'info');
    } catch (error) {
      handleApiError(error, 'Failed to stop all recordings');
    }
  }, [cameras, addNotification, handleApiError, addLog]);

  const addCamera = useCallback(
    async (name: string, url: string) => {
      try {
        const created = await apiClient.addCamera(name, url);
        setCameras((prev) => [...prev.filter((cam) => cam.id !== created.id), created]);
        addNotification(`Camera '${created.name}' registered.`, 'success');
      } catch (error) {
        handleApiError(error, 'Failed to add new camera');
      }
    },
    [addNotification, handleApiError]
  );

  const setCameraOffline = useCallback(
    (cameraId: string) => {
      setCameras((prev) =>
        prev.map((cam) => {
          if (cam.id === cameraId && cam.status !== CameraStatus.OFFLINE) {
            addLog({
              message: `Client-side stream error for '${cam.name}'. Marking as OFFLINE.`,
              level: 'warn',
            });
            return {
              ...cam,
              status: CameraStatus.OFFLINE,
              ping: -1,
              signal: -1,
              lastSeen: new Date().toISOString(),
            };
          }
          return cam;
        })
      );
    },
    [addLog]
  );

  return {
    cameras,
    tasks,
    logs,
    updateCamera,
    toggleRecording,
    addCamera,
    setCameraOffline,
    toggleFavorite,
    startAllRecording,
    stopAllRecording,
  };
};
