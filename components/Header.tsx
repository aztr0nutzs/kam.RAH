import React from 'react';
import type { GridLayout } from '../types';
import { Grid1x1Icon, Grid2x2Icon, Grid3x3Icon, HelpIcon, SettingsIcon } from './icons/UIIcons';

interface HeaderProps {
  layout: GridLayout;
  onLayoutChange: (layout: GridLayout) => void;
  onShowHelp: () => void;
  isSettingsPanelOpen: boolean;
  onToggleSettings: () => void;
}

const LayoutButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-colors ${
      isActive
        ? 'bg-[var(--color-neon-cyan)] text-black neon-glow-cyan'
        : 'hover:bg-[var(--color-neon-cyan)]/20'
    }`}
  >
    {children}
  </button>
);

export const Header: React.FC<HeaderProps> = ({ layout, onLayoutChange, onShowHelp, isSettingsPanelOpen, onToggleSettings }) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between p-3 bg-black/70 border-b-2 border-[var(--color-neon-purple)]">
      <h1 className="font-orbitron font-bold text-2xl animated-title-glow">
        CYBERSEC COMMAND
      </h1>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-black/50 p-1 rounded-lg">
          <LayoutButton
            onClick={() => onLayoutChange('1x1')}
            isActive={layout === '1x1'}
          >
            <Grid1x1Icon className="w-6 h-6" />
          </LayoutButton>
          <LayoutButton
            onClick={() => onLayoutChange('2x2')}
            isActive={layout === '2x2'}
          >
            <Grid2x2Icon className="w-6 h-6" />
          </LayoutButton>
          <LayoutButton
            onClick={() => onLayoutChange('3x3')}
            isActive={layout === '3x3'}
          >
            <Grid3x3Icon className="w-6 h-6" />
          </LayoutButton>
        </div>
        <LayoutButton onClick={onToggleSettings} isActive={isSettingsPanelOpen}>
            <SettingsIcon className="w-6 h-6" />
        </LayoutButton>
        <button onClick={onShowHelp} className="p-2 rounded-md hover:bg-[var(--color-neon-cyan)]/20">
            <HelpIcon className="w-6 h-6 text-glow-cyan" />
        </button>
      </div>
    </header>
  );
};