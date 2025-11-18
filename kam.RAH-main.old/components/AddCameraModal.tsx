import React, { useState } from 'react';
import { XIcon } from './icons/UIIcons';
import { sanitizeInput, isValidUrl } from '../utils/sanitize';

interface AddCameraModalProps {
  onAddCamera: (name: string, url: string) => void;
  onClose: () => void;
}

export const AddCameraModal: React.FC<AddCameraModalProps> = ({ onAddCamera, onClose }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (urlError) {
        setUrlError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name.trim());
    const cleanUrl = url.trim();

    if (!isValidUrl(cleanUrl)) {
        setUrlError('Please enter a valid HTTP/HTTPS URL.');
        return;
    }

    if (cleanName && cleanUrl) {
      onAddCamera(cleanName, cleanUrl);
      onClose();
    }
  };
  
  const isFormValid = name.trim() !== '' && url.trim() !== '';

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-black/80 border-2 border-[var(--color-neon-purple)] rounded-lg p-8 max-w-md w-full relative shadow-2xl shadow-purple-500/20"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
          <XIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-orbitron font-bold text-glow-cyan mb-6">ADD NEW CAMERA</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="camera-name" className="block text-sm font-medium text-[var(--color-neon-pink)] mb-2">
              Camera Name
            </label>
            <input
              id="camera-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Entrance"
              className="w-full bg-black/50 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-neon-cyan)]"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="stream-url" className="block text-sm font-medium text-[var(--color-neon-pink)] mb-2">
              Stream URL (HLS)
            </label>
            <input
              id="stream-url"
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://.../stream.m3u8"
              className="w-full bg-black/50 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-neon-cyan)]"
              required
            />
            {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
          </div>
          <div className="flex justify-end space-x-4 pt-4">
             <button
              type="button"
              onClick={onClose}
              className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="bg-[var(--color-neon-cyan)] text-black font-bold py-2 px-4 rounded-md transition-all duration-300 neon-glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Add Camera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};