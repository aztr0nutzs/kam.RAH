import { useState, useEffect, useCallback, useRef } from 'react';
import type { Camera, LogEntry, Notification, CameraSettings } from '../types';
import { CameraStatus } from '../types';
import * as apiClient from '../lib/apiClient';
import { ApiError } from '../lib/apiClient';

export const useApi = (addNotification: (message: string, level: Notification['level']) => void) => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const addLog = useCallback((log: Omit<LogEntry, 'timestamp'> & { timestamp?: Date | string }) => {
        const newLog = { ...log, timestamp: new Date(log.timestamp || new Date()) };
        setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
    }, []);

    const handleApiError = useCallback((error: unknown, contextMessage: string) => {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof ApiError) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(`${contextMessage}:`, error);
        addLog({ message: `${contextMessage}: ${errorMessage}`, level: 'error' });
        addNotification(`${contextMessage}: ${errorMessage}`, 'error');
    }, [addLog, addNotification]);
    
    const setupWebSocket = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const wsUrl = `ws://127.0.0.1:5000/ws/events`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            addLog({ message: 'Real-time connection to server established.', level: 'info'});
        };

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                addLog({ message: `Event received: ${data.event}`, level: 'info' });
                
                switch(data.event) {
                    case 'camera_status_update':
                    case 'camera_settings_update':
                        setCameras(prev => prev.map(c => c.id === data.payload.id ? data.payload : c));
                        break;
                    case 'camera_added':
                        setCameras(prev => [...prev, data.payload]);
                        addNotification(`New camera added: ${data.payload.name}`, 'success');
                        break;
                    case 'camera_removed':
                        setCameras(prev => prev.filter(c => c.id !== data.payload.id));
                        addNotification(`Camera removed.`, 'info');
                        break;
                    case 'motion_detected':
                        addLog({ message: `Motion detected on camera: ${data.payload.name}`, level: 'warn' });
                        addNotification(`Motion detected on ${data.payload.name}!`, 'info');
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
                addLog({ message: 'Received invalid WebSocket message.', level: 'error' });
            }
        };

        wsRef.current.onerror = (event) => {
            console.error("WebSocket Error:", event);
        };
        
        wsRef.current.onclose = (event) => {
            if (reconnectTimerRef.current) {
                return; // Reconnect already scheduled
            }
            let reason = 'Connection closed unexpectedly.';
            if (event.code === 1006) {
                reason = 'Connection aborted. Please check the server status.';
            } else if (event.reason) {
                reason = event.reason;
            }
            const message = `WebSocket: ${reason} Attempting to reconnect...`;
            addLog({ message, level: 'warn' });
            addNotification('Connection to server lost. Retrying...', 'error');
            
            reconnectTimerRef.current = setTimeout(setupWebSocket, 5000); // Reconnect after 5 seconds
        };

    }, [addLog, addNotification]);

    useEffect(() => {
        let isMounted = true;
        
        async function loadInitialData() {
            try {
                addLog({ message: 'Initializing system... Contacting command server.', level: 'info' });
                const initialCameras = await apiClient.getCameras();
                if (isMounted) {
                    const validCameras = initialCameras || [];
                    setCameras(validCameras);
                    addLog({ message: `Found ${validCameras.length} camera devices.`, level: 'info' });
                }
            } catch (error) {
                handleApiError(error, 'Failed to connect to server');
            }
        }
        
        loadInitialData();
        setupWebSocket();

        return () => {
            isMounted = false;
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
            if (wsRef.current) {
                wsRef.current.onclose = null; // Prevent reconnect logic from firing on intentional close
                wsRef.current.close();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // --- API Actions ---

    const updateCamera = useCallback(async (updatedCamera: Camera) => {
        try {
            await apiClient.updateCameraSettings(updatedCamera.id, updatedCamera.settings);
            addLog({ message: `Settings update command sent to '${updatedCamera.name}'.`, level: 'info' });
        } catch (error) {
            handleApiError(error, `Failed to update settings for ${updatedCamera.name}`);
        }
    }, [handleApiError, addLog]);

    const toggleRecording = useCallback(async (cameraId: string) => {
        try {
            const cam = cameras.find(c => c.id === cameraId);
            if (!cam) return;
            const shouldRecord = cam.status !== CameraStatus.RECORDING;
            await apiClient.toggleRecording(cameraId, shouldRecord);
            addLog({ message: `Toggle recording command sent to '${cam.name}'.`, level: 'info' });
        } catch (error) {
            handleApiError(error, `Failed to toggle recording`);
        }
    }, [cameras, handleApiError, addLog]);
    
    const toggleFavorite = useCallback(async (cameraId: string) => {
        try {
            const cam = cameras.find(c => c.id === cameraId);
            if (!cam) return;
            const updatedCamera = await apiClient.toggleFavorite(cameraId, cam.isFavorite);
            setCameras(prev => prev.map(c => c.id === updatedCamera.id ? updatedCamera : c));
            addLog({ message: `'${updatedCamera.name}' favorite status updated.`, level: 'info' });
        } catch (error) {
            handleApiError(error, 'Failed to update favorites');
        }
    }, [cameras, handleApiError, addLog]);

    const startAllRecording = useCallback(async () => {
        addLog({ message: 'Sending command: start recording on all cameras.', level: 'info' });
        const promises = cameras
            .filter(cam => cam.status === CameraStatus.ONLINE)
            .map(cam => apiClient.toggleRecording(cam.id, true));
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
            .filter(cam => cam.status === CameraStatus.RECORDING)
            .map(cam => apiClient.toggleRecording(cam.id, false));
        try {
            await Promise.all(promises);
            addNotification('Stopped recording on all cameras.', 'info');
        } catch (error) {
            handleApiError(error, 'Failed to stop all recordings');
        }
    }, [cameras, addNotification, handleApiError, addLog]);

    const addCamera = useCallback(async (name: string, url:string) => {
        try {
            await apiClient.addCamera(name, url);
        } catch (error) {
            handleApiError(error, `Failed to add new camera`);
        }
    }, [handleApiError]);
    
    const setCameraOffline = useCallback((cameraId: string) => {
        setCameras(prev =>
            prev.map(cam => {
                if (cam.id === cameraId && cam.status !== CameraStatus.OFFLINE) {
                    addLog({ message: `Client-side stream error for '${cam.name}'. Marking as OFFLLINE.`, level: 'warn' });
                    return { ...cam, status: CameraStatus.OFFLINE, ping: -1, signal: -1, lastSeen: new Date().toISOString() };
                }
                return cam;
            })
        );
    }, [addLog]);


    return { cameras, logs, updateCamera, toggleRecording, addCamera, setCameraOffline, toggleFavorite, startAllRecording, stopAllRecording };
};