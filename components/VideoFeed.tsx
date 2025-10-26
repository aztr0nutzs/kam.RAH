import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import type { Camera } from '../types';
import { CameraStatus } from '../types';
import { RecordIcon, SnapshotIcon, ZoomInIcon, MoonIcon, SunIcon } from './icons/UIIcons';

interface VideoFeedProps {
  camera: Camera;
  isSelected: boolean;
  onClick: () => void;
  onToggleRecording: (cameraId: string) => void;
}

const FeedControlButton: React.FC<{ onClick?: (e: React.MouseEvent) => void, children: React.ReactNode, active?: boolean }> = ({ onClick, children, active }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={`p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${active ? 'bg-[var(--color-neon-cyan)]/80 text-black neon-glow-cyan' : 'bg-black/50 hover:bg-[var(--color-neon-cyan)]/50'}`}
    >
        {children}
    </button>
);


export const VideoFeed: React.FC<VideoFeedProps> = ({ camera, isSelected, onClick, onToggleRecording }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNightVision, setIsNightVision] = useState(camera.settings.isNightVision);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(camera.url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(e => console.error("Autoplay was prevented.", e));
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current) {
      videoRef.current.src = camera.url;
    }
  }, [camera.url]);
  
  const filterStyle = {
    filter: `brightness(${camera.settings.brightness}%) contrast(${camera.settings.contrast}%) ${isNightVision ? 'grayscale(1) invert(1)' : ''}`
  };

  return (
    <div
      className={`relative group w-full h-full bg-black border-2 rounded-lg overflow-hidden transition-all duration-300 ${
        isSelected ? 'border-[var(--color-neon-cyan)] neon-glow-cyan' : 'border-gray-800'
      }`}
      onClick={onClick}
    >
      {camera.status !== CameraStatus.OFFLINE ? (
        <video ref={videoRef} muted className="w-full h-full object-cover" style={filterStyle}></video>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/80">
          <p className="text-2xl font-orbitron text-red-500">OFFLINE</p>
          <p className="text-gray-400">Last seen: {new Date(camera.lastSeen).toLocaleTimeString()}</p>
        </div>
      )}

      <div className="absolute top-2 left-2 right-2 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="bg-black/60 px-2 py-1 rounded-md text-white font-bold">{camera.name}</h3>
        {camera.status === CameraStatus.RECORDING && (
            <div className="flex items-center space-x-2 bg-red-600/80 px-3 py-1 rounded-full animate-pulse">
                <RecordIcon className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">REC</span>
            </div>
        )}
      </div>

      <div className="absolute bottom-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FeedControlButton onClick={() => setIsNightVision(!isNightVision)} active={isNightVision}>
              {isNightVision ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
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