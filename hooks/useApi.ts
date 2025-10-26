import { useState, useEffect, useCallback, useRef } from 'react';
import type { Camera, LogEntry } from '../types';
import { CameraStatus } from '../types';

export const useApi = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    const addLog = useCallback((log: Omit<LogEntry, 'timestamp'> & { timestamp?: Date | string }) => {
        const newLog = { ...log, timestamp: new Date(log.timestamp || new Date()) };
        setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
    }, []);

    useEffect(() => {
        const fetchCameras = async () => {
            try {
                const response = await fetch('/api/cameras');
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                const data: Camera[] = await response.json();
                const camerasWithDefaults = data.map(cam => ({
                    ...cam,
                    settings: cam.settings || { brightness: 100, contrast: 100, isNightVision: false }
                }));
                setCameras(camerasWithDefaults);
                addLog({ message: 'System initialized. Connected to camera network.', level: 'info' });
            } catch (error) {
                console.error("Failed to fetch cameras:", error);
                addLog({ message: `Failed to connect to camera network: ${error instanceof Error ? error.message : 'Unknown error'}`, level: 'error' });
            }
        };
        fetchCameras();

        const connectWebSocket = () => {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${window.location.host}/ws/events`;
            
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connection established.');
                addLog({ message: 'Real-time event stream connected.', level: 'info' });
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);

                    switch (message.type) {
                        case 'CAMERA_UPDATE': {
                            const updatedCamera = message.payload as Camera;
                            setCameras(prevCameras =>
                                prevCameras.map(cam =>
                                    cam.id === updatedCamera.id ? { ...cam, ...updatedCamera } : cam
                                )
                            );
                            break;
                        }
                        case 'NEW_LOG': {
                            addLog(message.payload as LogEntry);
                            break;
                        }
                        default:
                            console.warn('Unknown WebSocket message type:', message.type);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                addLog({ message: 'Real-time event stream connection error.', level: 'error' });
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket connection closed. Reconnecting...');
                addLog({ message: 'Real-time event stream disconnected. Attempting to reconnect...', level: 'warn' });
                setTimeout(connectWebSocket, 5000);
            };
        };
        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, [addLog]);

    const updateCamera = useCallback(async (updatedCamera: Camera) => {
        setCameras(prevCameras =>
            prevCameras.map(cam => (cam.id === updatedCamera.id ? updatedCamera : cam))
        );

        try {
            const response = await fetch(`/api/cameras/${updatedCamera.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCamera),
            });
            if (!response.ok) {
                throw new Error('Failed to update camera settings.');
            }
            addLog({ message: `Settings updated for camera '${updatedCamera.name}'.`, level: 'info' });
        } catch (error) {
            console.error(error);
            addLog({ message: `Failed to update settings for '${updatedCamera.name}'.`, level: 'error' });
        }
    }, [addLog]);

    const toggleRecording = useCallback(async (cameraId: string) => {
        const camera = cameras.find(cam => cam.id === cameraId);
        if (!camera || camera.status === CameraStatus.OFFLINE) return;

        const isCurrentlyRecording = camera.status === CameraStatus.RECORDING;
        const action = isCurrentlyRecording ? 'stop' : 'start';

        try {
            const response = await fetch(`/api/cameras/${cameraId}/record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            if (!response.ok) {
                throw new Error(`Failed to ${action} recording.`);
            }
            addLog({ message: `Request to ${action} recording for '${camera.name}' sent.`, level: 'info' });
        } catch (error) {
            console.error(error);
            addLog({ message: `Failed to send command to ${action} recording for '${camera.name}'.`, level: 'error' });
        }
    }, [cameras, addLog]);

    return { cameras, logs, updateCamera, toggleRecording };
};