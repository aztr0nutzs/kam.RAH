
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { DeviceList } from './components/DeviceList';
import { FeedGrid } from './components/FeedGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { StatusBar } from './components/StatusBar';
import { ConsentModal } from './components/ConsentModal';
import { HelpOverlay } from './components/HelpOverlay';
import { AddCameraModal } from './components/AddCameraModal';
import { Notification } from './components/Notification';
import { useApi } from './hooks/useApi';
import type { Camera, GridLayout, Notification as NotificationType } from './types';
import { PlayIcon, PauseIcon, StopIcon, DownloadIcon, XIcon } from './components/icons/UIIcons';
import { LoginPanel } from './components/LoginPanel';
import { useAuth } from './context/AuthContext';


// New BottomBar Component
const BottomBar: React.FC<{selectedCamera: Camera | null}> = ({selectedCamera}) => {
  return (
    <div className="flex-shrink-0 flex items-center space-x-4 p-2 bg-black/70 border-t-2 border-[var(--color-neon-purple)]">
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20" title="Play"><PlayIcon className="w-6 h-6"/></button>
        <button className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20" title="Pause"><PauseIcon className="w-6 h-6"/></button>
        <button className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20" title="Stop"><StopIcon className="w-6 h-6"/></button>
      </div>
      <div className="flex-1 flex items-center space-x-2">
        <span className="font-mono text-xs text-gray-400">00:00:00</span>
        <input type="range" className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider" defaultValue="0" />
        <span className="font-mono text-xs text-gray-400">00:00:00</span>
      </div>
      <button className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20" title="Export Clip">
        <DownloadIcon className="w-6 h-6"/>
      </button>
    </div>
  )
}

// New SystemSettingsModal Component
const SystemSettingsModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('Storage');
    const tabs = ['Storage', 'Network', 'Users', 'Backup'];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-black/80 border-2 border-[var(--color-neon-purple)] rounded-lg max-w-3xl w-full h-4/5 flex flex-col relative shadow-2xl shadow-purple-500/20"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full z-10">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="p-6">
                    <h1 className="text-2xl font-orbitron font-bold text-glow-cyan">SYSTEM SETTINGS</h1>
                </div>
                <div className="flex-1 flex border-t-2 border-[var(--color-neon-purple)]">
                    <aside className="w-48 border-r-2 border-[var(--color-neon-purple)] p-4">
                        <nav className="flex flex-col space-y-2">
                            {tabs.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left p-2 rounded-md font-bold ${activeTab === tab ? 'bg-[var(--color-neon-cyan)] text-black neon-glow-cyan-sm' : 'hover:bg-white/10'}`}>
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </aside>
                    <main className="flex-1 p-6 overflow-y-auto">
                        <h2 className="text-xl font-orbitron text-[var(--color-neon-pink)] mb-4">{activeTab}</h2>
                        {/* Content for tabs would go here */}
                        <p className="text-gray-400">Configuration for {activeTab.toLowerCase()} would appear here. // TODO: Implement settings forms.</p>
                    </main>
                </div>
                <div className="flex justify-end p-4 space-x-4 border-t-2 border-[var(--color-neon-purple)]">
                    <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">Cancel</button>
                    <button onClick={onClose} className="bg-[var(--color-neon-cyan)] text-black font-bold py-2 px-4 rounded-md transition-all duration-300 neon-glow-cyan">Save Changes</button>
                </div>
            </div>
        </div>
    )
}

function App() {
  const { isAuthenticated, user, logout, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = useCallback((message: string, level: NotificationType['level'] = 'info') => {
      const newNotification: NotificationType = {
        id: Date.now(),
        message,
        level,
      };
      setNotifications(prev => [newNotification, ...prev.slice(0,2)]);
  }, []);

  const dismissNotification = useCallback((id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const api = useApi(addNotification, { enabled: isAuthenticated, token });
  
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [layout, setLayout] = useState<GridLayout>('2x2');
  const [isDeviceListOpen, setIsDeviceListOpen] = useState(true);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isAddCameraModalOpen, setIsAddCameraModalOpen] = useState(false);
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedCamera(null);
      setHasConsented(false);
    }
  }, [isAuthenticated]);

  // Auto-select first camera once loaded
  useEffect(() => {
    if (isAuthenticated && !selectedCamera && api.cameras.length > 0) {
      setSelectedCamera(api.cameras[0]);
    }
  }, [api.cameras, selectedCamera, isAuthenticated]);
  
  // Keep selected camera in view
  const camerasById = useMemo(() => new Map(api.cameras.map(c => [c.id, c])), [api.cameras]);
  useEffect(() => {
      if (selectedCamera) {
          const updatedSelected = camerasById.get(selectedCamera.id);
          if (updatedSelected) {
              setSelectedCamera(updatedSelected);
          } else {
              setSelectedCamera(api.cameras[0] || null);
          }
      }
  }, [api.cameras, selectedCamera, camerasById]);

  const handleSelectCamera = (camera: Camera) => {
    setSelectedCamera(camera);
    if (!isSettingsPanelOpen) {
        setIsSettingsPanelOpen(true);
    }
  };

  const handleLayoutChange = (newLayout: GridLayout) => {
    setLayout(newLayout);
    if (newLayout === '1x1' && !selectedCamera && api.cameras.length > 0) {
        setSelectedCamera(api.cameras[0]);
    }
  };
  
  const handleToggleSettings = useCallback(() => {
    setIsSettingsPanelOpen(prev => !prev);
  }, []);
  
  const handleToggleDeviceList = useCallback(() => {
    setIsDeviceListOpen(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHelp && e.key === 'Escape') setShowHelp(false);
      if (isSystemSettingsOpen && e.key === 'Escape') setIsSystemSettingsOpen(false);
      if (isAddCameraModalOpen && e.key === 'Escape') setIsAddCameraModalOpen(false);
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || isAddCameraModalOpen || isSystemSettingsOpen) {
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        const camIndex = parseInt(e.key, 10) - 1;
        if (api.cameras[camIndex]) handleSelectCamera(api.cameras[camIndex]);
      } else if (e.key.toLowerCase() === 'g') {
        const layouts: GridLayout[] = ['1x1', '2x2', '3x3'];
        const nextIndex = (layouts.indexOf(layout) + 1) % layouts.length;
        handleLayoutChange(layouts[nextIndex]);
      } else if (e.key.toLowerCase() === 's') {
        handleToggleSettings();
      } else if (e.key.toLowerCase() === 'd') {
        handleToggleDeviceList();
      } else if (e.key.toLowerCase() === 'f' && selectedCamera) {
        api.toggleFavorite(selectedCamera.id);
      } else if (e.key.toLowerCase() === 'r' && selectedCamera) {
        api.toggleRecording(selectedCamera.id);
      } else if (e.key === '?') {
        setShowHelp(true);
      } else if (e.key === 'Escape') {
        if (showHelp) setShowHelp(false);
        else if (isSettingsPanelOpen) setIsSettingsPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [api, layout, isSettingsPanelOpen, showHelp, isSystemSettingsOpen, isAddCameraModalOpen, selectedCamera, handleToggleSettings, handleToggleDeviceList]);
  
  if (!isAuthenticated) {
    return <LoginPanel />;
  }

  if (!hasConsented) {
    return <ConsentModal onConsent={() => setHasConsented(true)} />;
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      <Header 
        layout={layout} 
        onLayoutChange={handleLayoutChange} 
        onShowHelp={() => setShowHelp(true)}
        isSettingsPanelOpen={isSettingsPanelOpen}
        onToggleSettings={handleToggleSettings}
        onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
        onOpenAddCameraModal={() => setIsAddCameraModalOpen(true)}
        onStartAllRecording={api.startAllRecording}
        onStopAllRecording={api.stopAllRecording}
        userName={user?.name}
        onLogout={logout}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
            <DeviceList 
                cameras={api.cameras} 
                selectedCamera={selectedCamera} 
                onSelectCamera={handleSelectCamera}
                isPanelOpen={isDeviceListOpen}
                onTogglePanel={handleToggleDeviceList}
                onOpenAddCameraModal={() => setIsAddCameraModalOpen(true)}
                onToggleFavorite={api.toggleFavorite}
            />
            <section className="flex-1 flex flex-col p-2 bg-grid-pattern">
              <FeedGrid 
                cameras={api.cameras} 
                layout={layout} 
                selectedCamera={selectedCamera} 
                onSelectCamera={handleSelectCamera}
                onToggleRecording={api.toggleRecording}
                onSetCameraOffline={api.setCameraOffline}
                onUpdateCamera={api.updateCamera}
              />
            </section>
            {isSettingsPanelOpen && (
                <SettingsPanel 
                    camera={selectedCamera} 
                    onUpdateCamera={api.updateCamera} 
                    onClose={() => setIsSettingsPanelOpen(false)}
                />
            )}
        </div>
        <BottomBar selectedCamera={selectedCamera} />
      </main>
      <StatusBar logs={api.logs} cameras={api.cameras} />
      
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {isSystemSettingsOpen && <SystemSettingsModal onClose={() => setIsSystemSettingsOpen(false)} />}
      {isAddCameraModalOpen && (
        <AddCameraModal 
          onAddCamera={api.addCamera}
          onClose={() => setIsAddCameraModalOpen(false)}
        />
      )}
      <div className="fixed bottom-4 right-4 w-full max-w-sm flex flex-col items-end space-y-2 z-50">
        {notifications.map(n => (
            <Notification key={n.id} notification={n} onDismiss={dismissNotification} />
        ))}
      </div>
    </div>
  );
}

export default App;
