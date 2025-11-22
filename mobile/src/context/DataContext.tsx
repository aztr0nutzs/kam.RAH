import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Camera, LogEntry, Notification, CameraStatus } from '../types/domain';
import * as apiClient from '../api/client';
import { WS_BASE_URL } from '../config/appConfig';

interface DataContextType {
  cameras: Camera[];
  logs: LogEntry[];
  notifications: Notification[];
  addNotification: (message: string, level: Notification['level']) => void;
  dismissNotification: (id: number) => void;
  refreshCameras: () => Promise<void>;
  updateCamera: (camera: Camera) => Promise<void>;
  toggleRecording: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addCamera: (name: string, url: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const addLog = useCallback((log: Omit<LogEntry, 'timestamp'>) => {
    const newLog = { ...log, timestamp: new Date().toISOString() };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, []);

  const addNotification = useCallback((message: string, level: Notification['level'] = 'info') => {
    const newNotif = { id: Date.now(), message, level };
    setNotifications(prev => [newNotif, ...prev]);
    // Auto dismiss
    setTimeout(() => {
      setNotifications(current => current.filter(n => n.id !== newNotif.id));
    }, 5000);
  }, []);

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const refreshCameras = useCallback(async () => {
    try {
      const data = await apiClient.getCameras();
      if(data) setCameras(data);
    } catch (e: any) {
      addLog({ message: `Failed to fetch cameras: ${e.message}`, level: 'error' });
      // If it's a network error, notify the user visibly
      if (e.message.includes('Network error')) {
        addNotification(e.message, 'error');
      }
    }
  }, [addLog, addNotification]);

  // WebSocket Setup
  useEffect(() => {
    const connectWs = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
      
      console.log(`Connecting WS to ${WS_BASE_URL}`);
      wsRef.current = new WebSocket(WS_BASE_URL);
      
      wsRef.current.onopen = () => {
        addLog({ message: 'Connected to real-time server', level: 'info' });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'camera_status_update' || data.event === 'camera_settings_update') {
             setCameras(prev => prev.map(c => c.id === data.payload.id ? data.payload : c));
          } else if (data.event === 'camera_added') {
             setCameras(prev => [...prev, data.payload]);
             addNotification(`Camera added: ${data.payload.name}`, 'success');
          } else if (data.event === 'camera_removed') {
             setCameras(prev => prev.filter(c => c.id !== data.payload.id));
          } else if (data.event === 'motion_detected') {
             addNotification(`Motion: ${data.payload.name}`, 'info');
             addLog({ message: `Motion on ${data.payload.name}`, level: 'warn' });
          }
        } catch (e) {
          console.warn('WS Parse Error', e);
        }
      };

      wsRef.current.onerror = (e: any) => {
        // Improve logging for React Native WS errors. 
        // The event object often has a 'message' property.
        const errorMsg = e.message || 'Unknown connection error';
        console.log('WS Error:', errorMsg);
        // Don't flood logs/notifications on initial connect failure
      };

      wsRef.current.onclose = (e) => {
        console.log('WS Closed', e.code, e.reason);
        // addLog({ message: 'WS Disconnected. Reconnecting...', level: 'warn' });
        setTimeout(connectWs, 5000);
      };
    };

    refreshCameras();
    connectWs();

    return () => {
      wsRef.current?.close();
    };
  }, [refreshCameras, addLog, addNotification]);

  // Actions
  const updateCamera = async (cam: Camera) => {
    try {
      await apiClient.updateCameraSettings(cam.id, cam.settings);
      // Optimistic update
      setCameras(prev => prev.map(c => c.id === cam.id ? cam : c));
    } catch (e: any) {
      addNotification('Failed to update settings', 'error');
    }
  };

  const toggleRecording = async (id: string) => {
    try {
      const cam = cameras.find(c => c.id === id);
      if (!cam) return;
      const isRec = cam.status === CameraStatus.RECORDING;
      await apiClient.toggleRecording(id, !isRec);
      addNotification(`${!isRec ? 'Started' : 'Stopped'} recording on ${cam.name}`, 'info');
    } catch (e: any) {
      addNotification('Failed to toggle recording', 'error');
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const cam = cameras.find(c => c.id === id);
      if (!cam) return;
      await apiClient.toggleFavorite(id, cam.isFavorite);
      setCameras(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    } catch (e: any) {
      addNotification('Failed to update favorite', 'error');
    }
  };

  const addCamera = async (name: string, url: string) => {
    try {
      await apiClient.addCamera(name, url);
      addNotification('Camera added successfully', 'success');
    } catch (e: any) {
      addNotification(e.message, 'error');
      throw e;
    }
  };

  return (
    <DataContext.Provider value={{
      cameras, logs, notifications,
      addNotification, dismissNotification, refreshCameras,
      updateCamera, toggleRecording, toggleFavorite, addCamera
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
