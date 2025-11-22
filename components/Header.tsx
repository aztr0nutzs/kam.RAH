
import React, { useState, useRef, useEffect } from 'react';
import type { GridLayout } from '../types';
import { 
  Grid1x1Icon, Grid2x2Icon, Grid3x3Icon, HelpIcon, SettingsIcon, UserCircleIcon, 
  BellIcon, CloudIcon, ServerIcon, DotsVerticalIcon, RecordIcon, CameraIcon, SnapshotIcon 
} from './icons/UIIcons';

interface HeaderProps {
  layout: GridLayout;
  onLayoutChange: (layout: GridLayout) => void;
  onShowHelp: () => void;
  isSettingsPanelOpen: boolean;
  onToggleSettings: () => void;
  onOpenSystemSettings: () => void;
  onOpenAddCameraModal: () => void;
  onStartAllRecording: () => void;
  onStopAllRecording: () => void;
}

const LayoutButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  title: string;
}> = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-md transition-colors ${
      isActive
        ? 'bg-[var(--color-neon-cyan)] text-black neon-glow-cyan'
        : 'hover:bg-[var(--color-neon-cyan)]/20'
    }`}
    aria-pressed={isActive}
  >
    {children}
  </button>
);

const QuickActionsDropdown: React.FC<Pick<HeaderProps, 'onOpenAddCameraModal' | 'onStartAllRecording' | 'onStopAllRecording'>> = 
  ({ onOpenAddCameraModal, onStartAllRecording, onStopAllRecording }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(prev => !prev)} className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20">
        <DotsVerticalIcon className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-black/90 border-2 border-[var(--color-neon-purple)] rounded-md shadow-lg z-20">
          <ul className="py-1">
            <li className="px-3 py-2 text-xs font-bold text-glow-cyan uppercase">Quick Actions</li>
            <li><button onClick={() => handleAction(onOpenAddCameraModal)} className="w-full text-left flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-neon-cyan)]/20"><CameraIcon className="w-5 h-5" /><span>Add Camera</span></button></li>
            <li><button className="w-full text-left flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-neon-cyan)]/20"><SnapshotIcon className="w-5 h-5" /><span>Snapshot All</span></button></li>
            <li><button onClick={() => handleAction(onStartAllRecording)} className="w-full text-left flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-pink)]"><RecordIcon className="w-5 h-5" /><span>Start All Recording</span></button></li>
            <li><button onClick={() => handleAction(onStopAllRecording)} className="w-full text-left flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-neon-cyan)]/20"><RecordIcon className="w-5 h-5" /><span>Stop All Recording</span></button></li>
          </ul>
        </div>
      )}
    </div>
  )
}

export const Header: React.FC<HeaderProps> = (props) => {
  const { layout, onLayoutChange, onShowHelp, isSettingsPanelOpen, onToggleSettings, onOpenSystemSettings } = props;
  const [isRemoteMode, setIsRemoteMode] = useState(false);

  return (
    <header className="flex-shrink-0 flex items-center justify-between p-3 bg-black/70 border-b-2 border-[var(--color-neon-purple)]">
      <h1 className="font-orbitron font-bold text-2xl animated-title-glow">
        CYBERSEC COMMAND
      </h1>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-black/50 p-1 rounded-lg">
          <LayoutButton onClick={() => onLayoutChange('1x1')} isActive={layout === '1x1'} title="Single View (G)">
            <Grid1x1Icon className="w-6 h-6" />
          </LayoutButton>
          <LayoutButton onClick={() => onLayoutChange('2x2')} isActive={layout === '2x2'} title="2x2 Grid (G)">
            <Grid2x2Icon className="w-6 h-6" />
          </LayoutButton>
          <LayoutButton onClick={() => onLayoutChange('3x3')} isActive={layout === '3x3'} title="3x3 Grid (G)">
            <Grid3x3Icon className="w-6 h-6" />
          </LayoutButton>
        </div>
        
        <div className="w-px h-8 bg-[var(--color-neon-purple)] mx-2"></div>

        <button onClick={() => setIsRemoteMode(prev => !prev)} title={isRemoteMode ? "Switch to LAN Mode" : "Switch to Remote Mode"} className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20">
          {isRemoteMode ? <CloudIcon className="w-6 h-6 text-glow-cyan" /> : <ServerIcon className="w-6 h-6 text-glow-cyan" />}
        </button>
        <LayoutButton onClick={onToggleSettings} isActive={isSettingsPanelOpen} title="Toggle Details Panel (S)">
            <SettingsIcon className="w-6 h-6" />
        </LayoutButton>
        <button onClick={onOpenSystemSettings} className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20" title="System Settings">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-glow-cyan"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.39.44 1.02.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.166.397.506.71.93.78l.894.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.93.78-.164.398-.142.854.108 1.204l.527.738c.32.43.27.96-.12 1.45l-.773.773a1.125 1.125 0 0 1-1.45.12l-.737-.527c-.35-.25-.806-.272-1.204-.108-.397.166-.71.506-.78.93l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.205.108l-.737.527a1.125 1.125 0 0 1-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.166-.397-.506-.71-.93-.78l-.894-.149c-.542-.09-.94-.56-.94-1.11v-1.093c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.164-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.108.397-.166.71-.506.78-.93l.149-.894Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
        </button>
        <button onClick={onShowHelp} className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20" title="Help (?)">
            <HelpIcon className="w-6 h-6 text-glow-cyan" />
        </button>

        <div className="w-px h-8 bg-[var(--color-neon-purple)] mx-2"></div>
        
        <button className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20 relative" title="Notifications">
            <BellIcon className="w-6 h-6"/>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-neon-pink)]"></span>
        </button>
        <button className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20" title="User Profile">
            <UserCircleIcon className="w-6 h-6"/>
        </button>
        <QuickActionsDropdown {...props} />
      </div>
    </header>
  );
};
