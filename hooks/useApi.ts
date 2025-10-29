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
            if (error.status === 401) {
              // Specific handling for auth errors
              errorMessage = 'Authentication failed. Please log in again.';
              // Could also trigger a logout action here
            }
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

        // P0-3: Parameterize WebSocket URL
        const wsUrl = (import.meta.env?.VITE_WS_URL as string) || 'ws://127.0.0.1:5000/ws/events';
        
        // Add auth token to WebSocket connection query
        const token = localStorage.getItem('authToken');
        const authedWsUrl = wsUrl.includes('?') 
            ? `${wsUrl}&token=${token}` 
            : `${wsUrl}?token=${token}`;

        wsRef.current = new WebSocket(authedWsUrl);

        wsRef.current.onopen = () => {
            addLog({ message: 'Real-time connection to server established.', level: 'info'});
        };

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if(data.event !== 'pong') { // Avoid logging keep-alive pongs
                    addLog({ message: `Event received: ${data.event}`, level: 'info' });
                }
                
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
                    case 'auth_failed':
                        addLog({ message: `WebSocket authentication failed: ${data.message}`, level: 'error' });
                        addNotification('Real-time connection failed (Auth).', 'error');
                        wsRef.current?.close(1008, 'Auth failed');
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
            if (event.code === 4001 || event.code === 1008) { // 4001=Custom Unauthorized, 1008=Policy Violation
                addLog({ message: 'WebSocket closed due to auth failure. Wont retry.', level: 'error' });
                return; // Do not retry
            }
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
    
    const loadInitialData = useCallback(async (isMounted: boolean) => {
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
    }, [addLog, handleApiError]);

    useEffect(() => {
        let isMounted = true;
        
        loadInitialData(isMounted);
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
    // Re-run setup if auth changes (e.g., login/logout)
    // We can't detect localStorage changes directly, so this relies on a parent component re-rendering.
    // For a more robust solution, a global auth context would be better.
    }, [loadInitialData, setupWebSocket]);


    // --- API Actions ---

    const updateCamera = useCallback(async (updatedCamera: Camera) => {
        // Optimistic update for responsive UI
        setCameras(prev => prev.map(c => c.id === updatedCamera.id ? updatedCamera : c));
        try {
            // Send only the settings payload
            const confirmedCamera = await apiClient.updateCameraSettings(updatedCamera.id, updatedCamera.settings);
            // Re-sync with confirmed state from server
            setCameras(prev => prev.map(c => c.id === confirmedCamera.id ? confirmedCamera : c));
            addLog({ message: `Settings update command sent to '${updatedCamera.name}'.`, level: 'info' });
        } catch (error) {
            handleApiError(error, `Failed to update settings for ${updatedCamera.name}`);
            // TODO: Could revert optimistic update here by re-fetching camera
        }
    }, [handleApiError, addLog]);

    const toggleRecording = useCallback(async (cameraId: string) => {
        try {
            const cam = cameras.find(c => c.id === cameraId);
            if (!cam) return;
            const shouldRecord = cam.status !== CameraStatus.RECORDING;
            
            // Call API and get confirmed state
            const updatedCamera = await apiClient.toggleRecording(cameraId, shouldRecord);
            
            // Update local state with confirmed camera
            setCameras(prev => prev.map(c => c.id === updatedCamera.id ? updatedCamera : c));
            addLog({ message: `Toggle recording command sent to '${cam.name}'.`, level: 'info' });
        } catch (error) {
            handleApiError(error, `Failed to toggle recording`);
        }
    }, [cameras, handleApiError, addLog]);
    
    const toggleFavorite = useCallback(async (cameraId: string) => {
        try {
            const cam = cameras.find(c => c.id === cameraId);
            if (!cam) return;

            // Send the *new* desired state
            const newFavoriteState = !cam.isFavorite;
            const updatedCamera = await apiClient.toggleFavorite(cameraId, newFavoriteState);
            
            setCameras(prev => prev.map(c => c.id === updatedCamera.id ? updatedCamera : c));
            addLog({ message: `'${updatedCamera.name}' favorite status updated.`, level: 'info' });
        } catch (error) {
            handleApiError(error, 'Failed to update favorites');
        }
    }, [cameras, handleApiError, addLog]);

    const startAllRecording = useCallback(async () => {
        addLog({ message: 'Sending command: start recording on all cameras.', level: 'info' });
        const camerasToStart = cameras.filter(cam => cam.status === CameraStatus.ONLINE);
        const promises = camerasToStart.map(cam => apiClient.toggleRecording(cam.id, true));
        
        try {
            const updatedCameras = await Promise.all(promises);
            
            // Update state with all returned cameras
            setCameras(prev => {
                const newCamerasMap = new Map(prev.map(c => [c.id, c]));
                updatedCameras.forEach(updatedCam => {
                    newCamerasMap.set(updatedCam.id, updatedCam);
                });
                return Array.from(newCamerasMap.values());
            });
            addNotification('Started recording on all online cameras.', 'info');
        } catch (error) {
            handleApiError(error, 'Failed to start all recordings');
        }
    }, [cameras, addNotification, handleApiError, addLog]);
    
    const stopAllRecording = useCallback(async () => {
        addLog({ message: 'Sending command: stop recording on all cameras.', level: 'info' });
        const camerasToStop = cameras.filter(cam => cam.status === CameraStatus.RECORDING);
        const promises = camerasToStop.map(cam => apiClient.toggleRecording(cam.id, false));

        try {
            const updatedCameras = await Promise.all(promises);
            
            // Update state with all returned cameras
            setCameras(prev => {
                const newCamerasMap = new Map(prev.map(c => [c.id, c]));
                updatedCameras.forEach(updatedCam => {
                    newCamerasMap.set(updatedCam.id, updatedCam);
                });
                return Array.from(newCamerasMap.values());
            });
            addNotification('Stopped recording on all cameras.', 'info');
        } catch (error) {
            handleApiError(error, 'Failed to stop all recordings');
        }
    }, [cameras, addNotification, handleApiError, addLog]);

    const addCamera = useCallback(async (name: string, url:string) => {
        try {
            // The WS event `camera_added` will handle adding to state
            await apiClient.addCamera(name, url);
        } catch (error) {
            handleApiError(error, `Failed to add new camera`);
        }
    }, [handleApiError]);
    
    const setCameraOffline = useCallback((cameraId: string) => {
        setCameras(prev =>
            prev.map(cam => {
                if (cam.id === cameraId && cam.status !== CameraStatus.OFFLINE) {
                    // P0-3: Fix "OFFLLINE" typo
                    addLog({ message: `Client-side stream error for '${cam.name}'. Marking as OFFLINE.`, level: 'warn' });
                    return { ...cam, status: CameraStatus.OFFLINE, ping: -1, signal: -1, lastSeen: new Date().toISOString() };
                }
                return cam;
            })
        );
    }, [addLog]);


    return { cameras, logs, updateCamera, toggleRecording, addCamera, setCameraOffline, toggleFavorite, startAllRecording, stopAllRecording };
};