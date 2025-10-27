import React, { useState, useEffect, useCallback } from 'react';
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

function App() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = useCallback((message: string, level: NotificationType['level'] = 'info') => {
      const newNotification: NotificationType = {
        id: Date.now(),
        message,
        level,
      };
      // For simplicity, we'll only show one notification at a time.
      setNotifications([newNotification]);
  }, []);

  const dismissNotification = useCallback((id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const { cameras, logs, updateCamera, toggleRecording, addCamera, setCameraOffline } = useApi(addNotification);
  
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [layout, setLayout] = useState<GridLayout>('2x2');
  const [isDeviceListOpen, setIsDeviceListOpen] = useState(true);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isAddCameraModalOpen, setIsAddCameraModalOpen] = useState(false);

  // Auto-select first camera once loaded
  useEffect(() => {
    if (!selectedCamera && cameras.length > 0) {
      setSelectedCamera(cameras[0]);
    }
  }, [cameras, selectedCamera]);

  const handleSelectCamera = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  const handleLayoutChange = (newLayout: GridLayout) => {
    setLayout(newLayout);
    if (newLayout === '1x1' && !selectedCamera && cameras.length > 0) {
        setSelectedCamera(cameras[0]);
    }
  };
  
  const handleCloseSettings = () => {
    setIsSettingsPanelOpen(false);
  };

  const handleToggleSettings = useCallback(() => {
    setIsSettingsPanelOpen(prev => !prev);
  }, []);
  
  const handleToggleDeviceList = useCallback(() => {
    setIsDeviceListOpen(prev => !prev);
  }, []);

  const handleOpenAddCameraModal = () => setIsAddCameraModalOpen(true);
  const handleCloseAddCameraModal = () => setIsAddCameraModalOpen(false);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHelp && e.key === 'Escape') {
        setShowHelp(false);
        return;
      }
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || isAddCameraModalOpen) {
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        const camIndex = parseInt(e.key, 10) - 1;
        if (cameras[camIndex]) {
          handleSelectCamera(cameras[camIndex]);
        }
      }

      if (e.key.toLowerCase() === 'g') {
        const layouts: GridLayout[] = ['1x1', '2x2', '3x3'];
        const currentIndex = layouts.indexOf(layout);
        const nextIndex = (currentIndex + 1) % layouts.length;
        handleLayoutChange(layouts[nextIndex]);
      }
      
      if (e.key.toLowerCase() === 's') {
        handleToggleSettings();
      }
       if (e.key.toLowerCase() === 'd') {
        handleToggleDeviceList();
      }

      if (e.key === 'Escape') {
        if (showHelp) setShowHelp(false);
        else if (isSettingsPanelOpen) handleCloseSettings();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameras, layout, isSettingsPanelOpen, showHelp, handleToggleSettings, handleToggleDeviceList, isAddCameraModalOpen]);
  
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
      />
      <main className="flex-1 flex overflow-hidden">
        <DeviceList 
            cameras={cameras} 
            selectedCamera={selectedCamera} 
            onSelectCamera={handleSelectCamera}
            isPanelOpen={isDeviceListOpen}
            onTogglePanel={handleToggleDeviceList}
            onOpenAddCameraModal={handleOpenAddCameraModal}
        />
        <section className="flex-1 flex flex-col p-2 bg-grid-pattern">
          <FeedGrid 
            cameras={cameras} 
            layout={layout} 
            selectedCamera={selectedCamera} 
            onSelectCamera={handleSelectCamera}
            onToggleRecording={toggleRecording}
            onSetCameraOffline={setCameraOffline}
          />
        </section>
        {isSettingsPanelOpen && (
            <SettingsPanel 
                camera={selectedCamera} 
                onUpdateCamera={updateCamera} 
                onClose={handleCloseSettings}
            />
        )}
      </main>
      <StatusBar logs={logs} cameras={cameras} />
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {isAddCameraModalOpen && (
        <AddCameraModal 
          onAddCamera={addCamera}
          onClose={handleCloseAddCameraModal}
        />
      )}
      {notifications.map(n => (
          <Notification key={n.id} notification={n} onDismiss={dismissNotification} />
      ))}
    </div>
  );
}

export default App;