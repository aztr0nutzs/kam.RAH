import React from 'react';
import type { Camera } from '../types';
import { CameraStatus } from '../types';
import { CameraIcon, UsbIcon, SmartphoneIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from './icons/UIIcons';

interface DeviceListProps {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onSelectCamera: (camera: Camera) => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onOpenAddCameraModal: () => void;
}

const CameraTypeIcon: React.FC<{ type: Camera['type'] }> = ({ type }) => {
  switch (type) {
    case 'IP':
      return <CameraIcon className="w-5 h-5 text-[var(--color-neon-purple)]" />;
    case 'USB':
      return <UsbIcon className="w-5 h-5 text-[var(--color-neon-purple)]" />;
    case 'Android':
      return <SmartphoneIcon className="w-5 h-5 text-[var(--color-neon-purple)]" />;
    default:
      return null;
  }
};

const StatusIndicator: React.FC<{ status: CameraStatus }> = ({ status }) => {
    let color = 'bg-gray-500';
    let glow = '';
    if (status === CameraStatus.ONLINE) color = 'bg-[var(--color-neon-mint)]';
    if (status === CameraStatus.RECORDING) {
        color = 'bg-[var(--color-neon-pink)]';
        glow = 'shadow-[0_0_8px_var(--color-neon-pink)]';
    }
    if (status === CameraStatus.OFFLINE) color = 'bg-gray-600';

    return <span className={`w-3 h-3 rounded-full ${color} ${glow} ${status === 'RECORDING' ? 'animate-pulse' : ''}`}></span>;
};

const DeviceListItem: React.FC<{
    camera: Camera;
    isSelected: boolean;
    isPanelOpen: boolean;
    onSelect: (camera: Camera) => void;
}> = React.memo(({ camera, isSelected, isPanelOpen, onSelect }) => {
    return (
        <li>
            <button
                onClick={() => onSelect(camera)}
                className={`w-full flex items-center space-x-3 p-2 rounded-md text-left transition-colors ${
                    isSelected
                    ? 'bg-[var(--color-neon-cyan)] text-black neon-glow-cyan-sm'
                    : 'hover:bg-[var(--color-neon-cyan)]/20'
                }`}
            >
                <CameraTypeIcon type={camera.type} />
                {isPanelOpen && (
                    <span className="flex-1 truncate">{camera.name}</span>
                )}
                <StatusIndicator status={camera.status} />
            </button>
        </li>
    );
});


export const DeviceList: React.FC<DeviceListProps> = ({ cameras, selectedCamera, onSelectCamera, isPanelOpen, onTogglePanel, onOpenAddCameraModal }) => {
  return (
    <aside className={`flex-shrink-0 bg-black/70 border-r-2 border-[var(--color-neon-purple)] transition-all duration-300 ${isPanelOpen ? 'w-64' : 'w-12'}`}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b-2 border-[var(--color-neon-purple)]">
           {isPanelOpen && <h2 className="font-orbitron font-bold text-lg text-glow-cyan">DEVICES</h2>}
            <div className="flex items-center space-x-2">
                {isPanelOpen && (
                    <button onClick={onOpenAddCameraModal} className="p-1 hover:bg-gray-700 rounded-md text-[var(--color-neon-mint)]" title="Add new camera">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={onTogglePanel} className="p-1 hover:bg-gray-700 rounded-md">
                    {isPanelOpen ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
                </button>
           </div>
        </div>
        <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-1">
                {cameras.map(camera => (
                    <DeviceListItem
                        key={camera.id}
                        camera={camera}
                        isSelected={selectedCamera?.id === camera.id}
                        isPanelOpen={isPanelOpen}
                        onSelect={onSelectCamera}
                    />
                ))}
            </ul>
        </nav>
      </div>
    </aside>
  );
};