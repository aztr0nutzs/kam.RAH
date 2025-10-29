
import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import type { Camera } from '../types';
import { CameraStatus } from '../types';
import { RecordIcon, SnapshotIcon, ZoomInIcon, MoonIcon, SunIcon, SignalIcon } from './icons/UIIcons';

interface VideoFeedProps {
  camera: Camera;
  isSelected: boolean;
  onClick: () => void;
  onToggleRecording: (cameraId: string) => void;
  onSetCameraOffline: (cameraId: string) => void;
  onUpdateCamera: (camera: Camera) => void;
}

const FeedControlButton: React.FC<{ onClick?: (e: React.MouseEvent) => void, children: React.ReactNode, active?: boolean }> = ({ onClick, children, active }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={`p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${active ? 'bg-[var(--color-neon-cyan)]/80 text-black neon-glow-cyan' : 'bg-black/50 hover:bg-[var(--color-neon-cyan)]/50'}`}
    >
        {children}
    </button>
);

const StreamHealthIndicator: React.FC<{ ping: number; signal: number }> = ({ ping, signal }) => {
    let colorClass = 'text-[var(--color-neon-pink)]';
    let title = `Poor Connection - Ping: ${ping}ms, Signal: ${signal}%`;

    if (signal > 90 && ping < 30) {
        colorClass = 'text-[var(--color-neon-mint)]';
        title = `Good Connection - Ping: ${ping}ms, Signal: ${signal}%`;
    } else if (signal > 75 && ping < 50) {
        colorClass = 'text-[var(--color-neon-purple)]';
        title = `Fair Connection - Ping: ${ping}ms, Signal: ${signal}%`;
    }

    return (
        <div title={title}>
            <SignalIcon className={`w-5 h-5 ${colorClass}`} />
        </div>
    );
};

const StreamHealthDot: React.FC<{ health: 'good' | 'fair' | 'poor' }> = ({ health }) => {
    let color = 'bg-[var(--color-neon-mint)]';
    let glow = 'shadow-[0_0_6px_var(--color-neon-mint)]';
    let title = 'Stream Health: Good';

    if (health === 'fair') {
        color = 'bg-[var(--color-neon-purple)]';
        glow = 'shadow-[0_0_6px_var(--color-neon-purple)]';
        title = 'Stream Health: Fair (Low Buffer)';
    } else if (health === 'poor') {
        color = 'bg-[var(--color-neon-pink)]';
        glow = 'shadow-[0_0_6px_var(--color-neon-pink)]';
        title = 'Stream Health: Poor (Buffering)';
    }

    return (
        <div title={title} className="flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${color} ${glow} transition-colors duration-500 ${health !== 'good' ? 'animate-pulse' : ''}`}></span>
        </div>
    );
};


const VideoFeedComponent: React.FC<VideoFeedProps> = ({ camera, isSelected, onClick, onToggleRecording, onSetCameraOffline, onUpdateCamera }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamHealth, setStreamHealth] = useState<'good' | 'fair' | 'poor'>('good');

  const isOnline = camera.status !== CameraStatus.OFFLINE;

  // HLS Setup Effect
  useEffect(() => {
    setStreamError(null);
    if (!isOnline) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
      return;
    }

    let hls: Hls | null = null;
    if (Hls.isSupported() && videoRef.current) {
      hls = new Hls();
      hls.loadSource(camera.url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error(`HLS fatal error for ${camera.name}:`, data);
          setStreamError('STREAM ERROR');
          onSetCameraOffline(camera.id);
        }
      });

    } else if (videoRef.current) {
      videoRef.current.src = camera.url;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [camera.url, camera.id, isOnline, onSetCameraOffline, camera.name]);
  
  // Stream Health Monitoring Effect
  useEffect(() => {
    if (!isOnline || !Hls.isSupported()) {
      return;
    }

    const intervalId = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const bufferEnd = videoRef.current.buffered.length > 0 
          ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1) 
          : 0;
        const currentTime = videoRef.current.currentTime;
        const bufferLength = bufferEnd - currentTime;

        const newHealth = bufferLength < 3 ? 'poor' : bufferLength < 8 ? 'fair' : 'good';
        setStreamHealth(newHealth);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(intervalId);
  }, [isOnline]);
  
  const handleToggleNightVision = () => {
    onUpdateCamera({
      ...camera,
      settings: {
        ...camera.settings,
        isNightVision: !camera.settings.isNightVision,
      }
    });
  };

  const filterStyle = {
    filter: `brightness(${camera.settings.brightness}%) contrast(${camera.settings.contrast}%) ${camera.settings.isNightVision ? 'grayscale(1) invert(1)' : ''}`
  };

  const renderContent = () => {
      if (streamError) {
          return (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/80">
                  <p className="text-2xl font-orbitron text-red-500">{streamError}</p>
                  <p className="text-gray-400">Invalid or unavailable source</p>
              </div>
          );
      }
      if (camera.status === CameraStatus.OFFLINE) {
          return (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/80">
                  <p className="text-2xl font-orbitron text-red-500">OFFLINE</p>
                  <p className="text-gray-400">Last seen: {new Date(camera.lastSeen).toLocaleTimeString()}</p>
              </div>
          );
      }
      return <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover" style={filterStyle}></video>;
  };

  return (
    <div
      className={`relative group w-full h-full bg-black border-2 rounded-lg overflow-hidden transition-all duration-300 ${
        isSelected ? 'border-[var(--color-neon-cyan)] neon-glow-cyan' : 'border-gray-800'
      }`}
      onClick={onClick}
    >
      {renderContent()}

      <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
        <div className="flex items-center space-x-2">
          {isOnline && !streamError && <StreamHealthDot health={streamHealth} />}
          <h3 className="bg-black/60 px-2 py-1 rounded-md text-white font-bold">{camera.name}</h3>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {camera.status !== CameraStatus.OFFLINE && !streamError && <StreamHealthIndicator ping={camera.ping} signal={camera.signal} />}
          </div>
        </div>
        {camera.status === CameraStatus.RECORDING && (
          <div className="flex items-center space-x-2 bg-red-600/80 px-3 py-1 rounded-full animate-pulse">
            <RecordIcon className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">REC</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FeedControlButton onClick={handleToggleNightVision} active={camera.settings.isNightVision}>
              {camera.settings.isNightVision ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </FeedControlButton>
          <FeedControlButton>
              <ZoomInIcon className="w-5 h-5" />
          </FeedControlButton>
          <FeedControlButton>
              <SnapshotIcon className="w-5 h-5" />
          </FeedControlButton>
          <FeedControlButton onClick={() => onToggleRecording(camera.id)} active={camera.status === CameraStatus.RECORDING}>
              <RecordIcon className="w-5 h-5" />
          </FeedControlButton>
      </div>
    </div>
  );
};

export const VideoFeed = React.memo(VideoFeedComponent);
