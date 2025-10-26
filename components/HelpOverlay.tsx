import React from 'react';
import { XIcon } from './icons/UIIcons';

interface HelpOverlayProps {
  onClose: () => void;
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-40 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-black/80 border-2 border-[var(--color-neon-purple)] rounded-lg p-8 max-w-2xl w-full relative shadow-2xl shadow-purple-500/20"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <XIcon className="w-6 h-6" />
        </button>

        <h1 className="text-2xl font-orbitron font-bold text-glow-cyan mb-6">Help & Keyboard Shortcuts</h1>
        
        <div className="space-y-4 text-gray-300">
            <div>
                <h2 className="font-bold text-lg mb-2 text-[var(--color-neon-pink)]">Interface Guide</h2>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Device List:</strong> On the left, shows all connected cameras. Click a camera to select it.</li>
                    <li><strong>Feed Grid:</strong> The main area displays video feeds. Click on a feed to select it.</li>
                    <li><strong>Settings Panel:</strong> On the right, configure brightness, contrast, and other settings for the selected camera.</li>
                    <li><strong>Header Controls:</strong> Use the buttons in the top-right to change the grid layout.</li>
                </ul>
            </div>
             <div>
                <h2 className="font-bold text-lg mb-2 text-[var(--color-neon-pink)]">Keyboard Shortcuts</h2>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <dt className="font-mono font-semibold text-[var(--color-neon-cyan)]">1-9</dt>
                    <dd>Select camera 1 through 9.</dd>
                    <dt className="font-mono font-semibold text-[var(--color-neon-cyan)]">G</dt>
                    <dd>Toggle grid layout (1x1, 2x2, 3x3).</dd>
                     <dt className="font-mono font-semibold text-[var(--color-neon-cyan)]">S</dt>
                    <dd>Toggle settings panel for selected camera.</dd>
                    <dt className="font-mono font-semibold text-[var(--color-neon-cyan)]">D</dt>
                    <dd>Toggle devices list.</dd>
                     <dt className="font-mono font-semibold text-[var(--color-neon-cyan)]">ESC</dt>
                    <dd>Close this help overlay or any open panel.</dd>
                </dl>
            </div>
        </div>

      </div>
    </div>
  );
};
