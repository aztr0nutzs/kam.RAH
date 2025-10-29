
import React, { useState, useMemo } from 'react';
import type { Camera } from '../types';
import { CameraStatus } from '../types';
import { CameraIcon, UsbIcon, SmartphoneIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, StarIcon, SearchIcon } from './icons/UIIcons';

interface DeviceListProps {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onSelectCamera: (camera: Camera) => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onOpenAddCameraModal: () => void;
  onToggleFavorite: (cameraId: string) => void;
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
    onToggleFavorite: (cameraId: string) => void;
}> = React.memo(({ camera, isSelected, isPanelOpen, onSelect, onToggleFavorite }) => {
    return (
        <li>
            <div
                className={`w-full flex items-center space-x-3 p-2 rounded-md text-left transition-colors group ${
                    isSelected
                    ? 'bg-[var(--color-neon-cyan)] text-black neon-glow-cyan-sm'
                    : 'hover:bg-[var(--color-neon-cyan)]/20'
                }`}
            >
                <button onClick={() => onSelect(camera)} className="flex-1 flex items-center space-x-3 min-w-0">
                    <CameraTypeIcon type={camera.type} />
                    {isPanelOpen && (
                        <span className="flex-1 truncate">{camera.name}</span>
                    )}
                    <StatusIndicator status={camera.status} />
                </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(camera.id); }} 
                    className={`p-1 rounded-full ${isSelected ? 'text-black' : 'text-gray-600 group-hover:text-yellow-400'}`}
                    title={camera.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={camera.isFavorite}
                >
                    <StarIcon filled={camera.isFavorite} className={`w-5 h-5 ${camera.isFavorite ? 'text-yellow-400' : ''}`} />
                 </button>
            </div>
        </li>
    );
});


export const DeviceList: React.FC<DeviceListProps> = (props) => {
  const { cameras, selectedCamera, onSelectCamera, isPanelOpen, onTogglePanel, onOpenAddCameraModal, onToggleFavorite } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const filteredCameras = useMemo(() => {
    return cameras.filter(camera => {
      const matchesSearch = camera.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            camera.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            camera.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFavorite = !showFavorites || camera.isFavorite;
      return matchesSearch && matchesFavorite;
    });
  }, [cameras, searchTerm, showFavorites]);

  return (
    <aside className={`flex-shrink-0 bg-black/70 border-r-2 border-[var(--color-neon-purple)] transition-all duration-300 ${isPanelOpen ? 'w-64' : 'w-16'}`}>
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
        {isPanelOpen && (
            <div className="p-2 border-b border-[var(--color-neon-purple)]/50">
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Filter cameras..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/50 border border-gray-600 rounded-md p-2 pl-8 text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)]"
                    />
                    <SearchIcon className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="mt-2">
                    <button onClick={() => setShowFavorites(v => !v)} className={`w-full flex items-center justify-center space-x-2 p-1 rounded-md text-sm ${showFavorites ? 'bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)]' : 'bg-black/50'}`}>
                        <StarIcon filled={showFavorites} className="w-4 h-4 text-yellow-400"/>
                        <span>Favorites Only</span>
                    </button>
                </div>
            </div>
        )}
        <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-1">
                {filteredCameras.map(camera => (
                    <DeviceListItem
                        key={camera.id}
                        camera={camera}
                        isSelected={selectedCamera?.id === camera.id}
                        isPanelOpen={isPanelOpen}
                        onSelect={onSelectCamera}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </ul>
        </nav>
      </div>
    </aside>
  );
};
