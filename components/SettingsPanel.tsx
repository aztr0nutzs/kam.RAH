import React, { useState, useId } from 'react';
import type { Camera, CameraSettings } from '../types';
import { XIcon, MoonIcon, SunIcon, ChevronDownIcon, ChevronUpIcon } from './icons/UIIcons';

interface SettingsPanelProps {
  camera: Camera | null;
  onUpdateCamera: (camera: Camera) => void;
  onClose: () => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (value: number) => void, min?: number, max?: number, unit?: string }> = ({ label, value, onChange, min = 0, max = 200, unit = '' }) => {
  const id = useId();
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
          <label htmlFor={id} className="text-sm font-medium text-[var(--color-neon-pink)]">{label}</label>
          <span className="text-sm font-mono bg-black/50 px-2 py-0.5 rounded">{value}{unit}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
      />
    </div>
  );
};

const Toggle: React.FC<{ label: string; isChecked: boolean; onChange: (isChecked: boolean) => void, children?: React.ReactNode }> = ({ label, isChecked, onChange, children }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-neon-pink)]">{label}</span>
        <button 
            onClick={() => onChange(!isChecked)} 
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isChecked ? 'bg-[var(--color-neon-cyan)]' : 'bg-gray-600'}`}
            role="switch"
            aria-checked={isChecked}
            aria-label={`Toggle ${label}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const Select: React.FC<{ label: string, value: string, options: string[], onChange: (value: any) => void }> = ({ label, value, options, onChange }) => {
  const id = useId();
  return (
    <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-neon-pink)]">{label}</label>
        <select 
            id={id} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="bg-black/50 border border-gray-600 rounded-md p-1 text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)]"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
  );
};

const PTZControl: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
      <div/>
      <button aria-label="Pan up" className="bg-gray-700 rounded p-2 hover:bg-[var(--color-neon-cyan)]/50">▲</button>
      <div/>
      <button aria-label="Pan left" className="bg-gray-700 rounded p-2 hover:bg-[var(--color-neon-cyan)]/50">◀</button>
      <button aria-label="Go to home position" className="bg-gray-700 rounded p-2 hover:bg-[var(--color-neon-cyan)]/50">●</button>
      <button aria-label="Pan right" className="bg-gray-700 rounded p-2 hover:bg-[var(--color-neon-cyan)]/50">▶</button>
      <button aria-label="Zoom out" className="bg-gray-700 rounded p-2 hover:bg-[var(--color-neon-cyan)]/50 col-span-1">-</button>
      <button aria-label="Zoom in" className="bg-gray-700 rounded p-2 hover:bg-[var(--color-neon-cyan)]/50 col-span-2">Zoom</button>
    </div>
  );
}


const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const id = useId();
    return (
        <div className="border-t border-[var(--color-neon-purple)] py-4">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center text-left"
                aria-expanded={isOpen}
                aria-controls={id}
            >
                <h4 className="font-semibold text-md text-[var(--color-neon-mint)]">{title}</h4>
                {isOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
            </button>
            {isOpen && (
                <div id={id} className="mt-4 space-y-4">
                    {children}
                </div>
            )}
        </div>
    )
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ camera, onUpdateCamera, onClose }) => {
  
  /**
   * Handles changes to top-level settings properties
   */
  const handleSettingChange = (key: keyof CameraSettings, value: any) => {
    if (!camera) return;
    onUpdateCamera({
      ...camera,
      settings: {
        ...camera.settings,
        [key]: value,
      },
    });
  };

  /**
   * Handles changes to nested settings properties (e.g., recording.mode)
   */
  const handleNestedSettingChange = (
    parentKey: keyof Pick<CameraSettings, 'motionDetection' | 'recording' | 'ptz'>, 
    nestedKey: string, 
    value: any
  ) => {
    if (!camera) return;
    
    // Type assertion to help TypeScript
    const parentSetting = camera.settings[parentKey] as any;

    onUpdateCamera({
      ...camera,
      settings: {
        ...camera.settings,
        [parentKey]: {
          ...parentSetting,
          [nestedKey]: value,
        }
      },
    });
  };


  return (
    <aside className="w-80 flex-shrink-0 bg-black/70 border-l-2 border-[var(--color-neon-purple)] flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between p-4 border-b-2 border-[var(--color-neon-purple)]">
        <h2 className="text-lg font-bold font-orbitron text-glow-cyan">DETAILS</h2>
        <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-700 rounded-md"
            aria-label="Close settings panel"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {camera ? (
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-md font-semibold text-glow-cyan truncate mb-2">{camera.name}</h3>
          <div className="text-xs text-gray-400 space-y-1 mb-4">
              <p><strong>Status:</strong> <span className={camera.status === 'ONLINE' ? 'text-[var(--color-neon-mint)]' : camera.status === 'RECORDING' ? 'text-[var(--color-neon-pink)]' : 'text-gray-500'}>{camera.status}</span></p>
              <p><strong>Ping:</strong> {camera.ping > 0 ? `${camera.ping}ms` : 'N/A'}</p>
              <p><strong>Signal:</strong> {camera.signal > 0 ? `${camera.signal}%` : 'N/A'}</p>
          </div>
          
          <CollapsibleSection title="Video & Stream">
            <Slider label="Brightness" value={camera.settings.brightness} onChange={(v) => handleSettingChange('brightness', v)} />
            <Slider label="Contrast" value={camera.settings.contrast} onChange={(v) => handleSettingChange('contrast', v)} />
            <Toggle label="Night Vision" isChecked={camera.settings.isNightVision} onChange={(v) => handleSettingChange('isNightVision', v)} />
            <Select label="Resolution" value={camera.settings.resolution} options={['1080p', '720p', '480p']} onChange={(v) => handleSettingChange('resolution', v)} />
            <Select label="Codec" value={camera.settings.codec} options={['H.264', 'H.265']} onChange={(v) => handleSettingChange('codec', v)} />
            <Slider label="Framerate" value={camera.settings.fps} min={1} max={60} unit="fps" onChange={(v) => handleSettingChange('fps', v)} />
            <Slider label="Bitrate" value={camera.settings.bitrate} min={512} max={8192} unit="kbps" onChange={(v) => handleSettingChange('bitrate', v)} />
          </CollapsibleSection>

          {camera.settings.ptz.enabled && (
            <CollapsibleSection title="Camera Controls (PTZ)">
                <PTZControl />
                <Select label="Preset" value={''} options={['', ...camera.settings.ptz.presets.map(p => p.name)]} onChange={() => { /* // TODO: Implement preset selection logic */ }} />
            </CollapsibleSection>
          )}

          <CollapsibleSection title="Recording & Motion">
            <Select label="Mode" value={camera.settings.recording.mode} options={['off', 'continuous', 'motion', 'schedule']} onChange={(v) => handleNestedSettingChange('recording', 'mode', v)} />
            <Slider label="Retention" value={camera.settings.recording.retentionDays} min={1} max={90} unit=" days" onChange={(v) => handleNestedSettingChange('recording', 'retentionDays', v)} />
            <Toggle label="Motion Detection" isChecked={camera.settings.motionDetection.enabled} onChange={(v) => handleNestedSettingChange('motionDetection', 'enabled', v)} />
            <Slider label="Sensitivity" value={camera.settings.motionDetection.sensitivity} min={0} max={100} onChange={(v) => handleNestedSettingChange('motionDetection', 'sensitivity', v)} />
             <button className="w-full p-2 bg-gray-700 text-center rounded-md hover:bg-[var(--color-neon-cyan)]/50">Edit Motion Zones</button>
          </CollapsibleSection>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-gray-400 text-center">Select a camera to view its details and settings.</p>
        </div>
      )}
    </aside>
  );
};