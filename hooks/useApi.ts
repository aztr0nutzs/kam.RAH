import { useState, useEffect, useCallback } from 'react';
import type { Camera, LogEntry, Notification } from '../types';
import { CameraStatus } from '../types';

// --- MOCK DATA ---

const MOCK_CAMERAS: Camera[] = [
  {
    id: 'cam-001',
    name: 'Lobby Entrance',
    type: 'IP',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Public HLS test stream
    status: CameraStatus.ONLINE,
    ping: 24,
    signal: 95,
    lastSeen: new Date().toISOString(),
    settings: { brightness: 100, contrast: 100, isNightVision: false },
  },
  {
    id: 'cam-002',
    name: 'Rooftop Drone',
    type: 'Android',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: CameraStatus.RECORDING,
    ping: 45,
    signal: 88,
    lastSeen: new Date().toISOString(),
    settings: { brightness: 110, contrast: 95, isNightVision: false },
  },
  {
    id: 'cam-003',
    name: 'Server Room',
    type: 'USB',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: CameraStatus.ONLINE,
    ping: 12,
    signal: 100,
    lastSeen: new Date().toISOString(),
    settings: { brightness: 80, contrast: 120, isNightVision: true },
  },
  {
    id: 'cam-004',
    name: 'Parking Lot West',
    type: 'IP',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: CameraStatus.OFFLINE,
    ping: -1,
    signal: -1,
    lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    settings: { brightness: 100, contrast: 100, isNightVision: false },
  },
  {
    id: 'cam-005',
    name: 'West Corridor',
    type: 'IP',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: CameraStatus.ONLINE,
    ping: 33,
    signal: 92,
    lastSeen: new Date().toISOString(),
    settings: { brightness: 90, contrast: 110, isNightVision: false },
  },
  {
    id: 'cam-006',
    name: 'Loading Bay',
    type: 'IP',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: CameraStatus.ONLINE,
    ping: 51,
    signal: 78,
    lastSeen: new Date().toISOString(),
    settings: { brightness: 100, contrast: 100, isNightVision: false },
  },
];

const MOCK_LOG_MESSAGES: Omit<LogEntry, 'timestamp'>[] = [
    { message: 'Motion detected: Lobby Entrance.', level: 'warn' },
    { message: 'Signal strength fluctuating for Rooftop Drone.', level: 'warn' },
    { message: 'User \'admin\' accessed Server Room feed.', level: 'info' },
    { message: 'Firmware update available for IP cameras.', level: 'info' },
    { message: 'High temperature alert: Server Room.', level: 'error' },
];


export const useApi = (addNotification: (message: string, level: Notification['level']) => void) => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = useCallback((log: Omit<LogEntry, 'timestamp'> & { timestamp?: Date | string }) => {
        const newLog = { ...log, timestamp: new Date(log.timestamp || new Date()) };
        setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
        if (newLog.level === 'error') {
            addNotification(newLog.message, 'error');
        }
    }, [addNotification]);

    // Initial data load
    useEffect(() => {
        setCameras(MOCK_CAMERAS);
        addLog({ message: 'System initialized. Connected to mock camera network.', level: 'info' });
    }, [addLog]);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Update camera stats and status
            setCameras(prevCameras => {
                return prevCameras.map(cam => {
                    // Handle ONLINE/RECORDING cameras
                    if (cam.status !== CameraStatus.OFFLINE) {
                        // 5% chance to go offline, but not if it's the last one
                        if (Math.random() < 0.05 && prevCameras.filter(c => c.status !== CameraStatus.OFFLINE).length > 1) {
                            addLog({ message: `Connection lost to '${cam.name}'.`, level: 'error' });
                            return { ...cam, status: CameraStatus.OFFLINE, ping: -1, signal: -1, lastSeen: new Date().toISOString() };
                        }
                        // Otherwise, update stats
                        return {
                            ...cam,
                            ping: Math.max(10, cam.ping + Math.floor(Math.random() * 10) - 5),
                            signal: Math.max(70, Math.min(100, cam.signal + Math.floor(Math.random() * 4) - 2)),
                            lastSeen: new Date().toISOString(),
                        };
                    }
                    
                    // Handle OFFLINE cameras: attempt reconnection
                    // 20% chance to come back online
                    if (cam.status === CameraStatus.OFFLINE && Math.random() < 0.2) {
                        addLog({ message: `Reconnection successful for '${cam.name}'. Stream is now online.`, level: 'info' });
                        return {
                            ...cam,
                            status: CameraStatus.ONLINE,
                            ping: Math.floor(Math.random() * 40) + 10,
                            signal: Math.floor(Math.random() * 20) + 80,
                            lastSeen: new Date().toISOString(),
                        };
                    }
                    
                    // No change for offline cameras that stay offline
                    return cam;
                });
            });

            // Add a random log
            if (Math.random() > 0.7) {
                 const randomLog = MOCK_LOG_MESSAGES[Math.floor(Math.random() * MOCK_LOG_MESSAGES.length)];
                 addLog(randomLog);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [addLog]);

    const updateCamera = useCallback(async (updatedCamera: Camera) => {
        setCameras(prevCameras =>
            prevCameras.map(cam => (cam.id === updatedCamera.id ? updatedCamera : cam))
        );
        addLog({ message: `Settings updated for camera '${updatedCamera.name}'.`, level: 'info' });
    }, [addLog]);

    const toggleRecording = useCallback((cameraId: string) => {
        setCameras(prevCameras => {
            const newCameras = prevCameras.map(cam => {
                if (cam.id === cameraId && cam.status !== CameraStatus.OFFLINE) {
                    const isRecording = cam.status === CameraStatus.RECORDING;
                    const newStatus = isRecording ? CameraStatus.ONLINE : CameraStatus.RECORDING;
                    addLog({ message: `${isRecording ? 'Stopped' : 'Started'} recording on '${cam.name}'.`, level: 'info' });
                    return { ...cam, status: newStatus };
                }
                return cam;
            });
            return newCameras;
        });
    }, [addLog]);

    const addCamera = useCallback(async (name: string, url:string) => {
        const newCamera: Camera = {
            id: `cam-${Date.now()}`,
            name,
            url,
            type: 'IP',
            status: CameraStatus.ONLINE, // Assume online until a check fails
            ping: Math.floor(Math.random() * 30) + 10,
            signal: Math.floor(Math.random() * 20) + 80,
            lastSeen: new Date().toISOString(),
            settings: {
                brightness: 100,
                contrast: 100,
                isNightVision: false,
            },
        };
        setCameras(prevCameras => [...prevCameras, newCamera]);
        const message = `New camera source added: '${name}'.`;
        addLog({ message, level: 'info' });
        addNotification(message, 'success');
    }, [addLog, addNotification]);
    
    const setCameraOffline = useCallback((cameraId: string) => {
        setCameras(prevCameras =>
            prevCameras.map(cam => {
                if (cam.id === cameraId && cam.status !== CameraStatus.OFFLINE) {
                    addLog({ message: `Stream error for '${cam.name}'. Setting to OFFLINE.`, level: 'error' });
                    return { ...cam, status: CameraStatus.OFFLINE, ping: -1, signal: -1, lastSeen: new Date().toISOString() };
                }
                return cam;
            })
        );
    }, [addLog]);


    return { cameras, logs, updateCamera, toggleRecording, addCamera, setCameraOffline };
};