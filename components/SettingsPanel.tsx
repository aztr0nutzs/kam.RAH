import React from 'react';
import type { Camera } from '../types';
import { XIcon, MoonIcon, SunIcon } from './icons/UIIcons';

interface SettingsPanelProps {
  camera: Camera | null;
  onUpdateCamera: (camera: Camera) => void;
  onClose: () => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-[var(--color-neon-pink)]">{label}</label>
        <span className="text-sm font-mono bg-black/50 px-2 py-0.5 rounded">{value}</span>
    </div>
    <input
      type="range"
      min="0"
      max="200"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
    />
  </div>
);

const Toggle: React.FC<{ label: string; isChecked: boolean; onChange: (isChecked: boolean) => void }> = ({ label, isChecked, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-neon-pink)]">{label}</span>
        <button onClick={() => onChange(!isChecked)} className={`p-2 rounded-full transition-colors ${isChecked ? 'bg-[var(--color-neon-cyan)] text-black neon-glow-cyan' : 'bg-gray-700 hover:bg-[var(--color-neon-cyan)]/50'}`}>
            {isChecked ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
        </button>
    </div>
);


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ camera, onUpdateCamera, onClose }) => {
  const handleSettingChange = (setting: keyof Camera['settings'], value: any) => {
    if (!camera) return;
    const updatedCamera = {
      ...camera,
      settings: {
        ...camera.settings,
        [setting]: value,
      },
    };
    onUpdateCamera(updatedCamera);
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-black/70 border-l-2 border-[var(--color-neon-purple)] p-4 flex flex-col space-y-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-orbitron text-glow-cyan">SETTINGS</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-md">
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {camera ? (
        <div className="flex-1 space-y-6 overflow-y-auto">
          <h3 className="text-md font-semibold text-glow-cyan truncate">{camera.name}</h3>
          <Slider
            label="Brightness"
            value={camera.settings.brightness}
            onChange={(v) => handleSettingChange('brightness', v)}
          />
          <Slider
            label="Contrast"
            value={camera.settings.contrast}
            onChange={(v) => handleSettingChange('contrast', v)}
          />
          <Toggle 
              label="Night Vision"
              isChecked={camera.settings.isNightVision}
              onChange={(v) => handleSettingChange('isNightVision', v)}
          />
          <div className="border-t border-[var(--color-neon-purple)] my-4"></div>
          <div className="text-xs text-gray-400 space-y-2">
              <p><strong>Status:</strong> <span className={camera.status === 'ONLINE' ? 'text-[var(--color-neon-mint)]' : camera.status === 'RECORDING' ? 'text-[var(--color-neon-pink)]' : 'text-gray-500'}>{camera.status}</span></p>
              <p><strong>Ping:</strong> {camera.ping > 0 ? `${camera.ping}ms` : 'N/A'}</p>
              <p><strong>Signal:</strong> {camera.signal > 0 ? `${camera.signal}%` : 'N/A'}</p>
              <p><strong>Last Seen:</strong> {new Date(camera.lastSeen).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-center">Select a camera to view its settings.</p>
        </div>
      )}
    </aside>
  );
};