
import React from 'react';
import type { Camera, GridLayout } from '../types';
import { VideoFeed } from './VideoFeed';

interface FeedGridProps {
  cameras: Camera[];
  layout: GridLayout;
  selectedCamera: Camera | null;
  onSelectCamera: (camera: Camera) => void;
  onToggleRecording: (cameraId: string) => void;
  onSetCameraOffline: (cameraId: string) => void;
}

export const FeedGrid: React.FC<FeedGridProps> = ({ cameras, layout, selectedCamera, onSelectCamera, onToggleRecording, onSetCameraOffline }) => {
  const gridClasses = {
    '1x1': 'grid-cols-1 grid-rows-1',
    '2x2': 'grid-cols-2 grid-rows-2',
    '3x3': 'grid-cols-3 grid-rows-3',
  };

  const camerasToDisplay = layout === '1x1' && selectedCamera 
    ? [selectedCamera] 
    : (layout === '2x2' ? cameras.slice(0, 4) : cameras);

  return (
    <div className={`grid gap-2 w-full h-full ${gridClasses[layout]}`}>
      {camerasToDisplay.map((camera) => (
        <VideoFeed
          key={camera.id}
          camera={camera}
          isSelected={selectedCamera?.id === camera.id}
          onClick={() => onSelectCamera(camera)}
          onToggleRecording={onToggleRecording}
          onSetCameraOffline={onSetCameraOffline}
        />
      ))}
    </div>
  );
};