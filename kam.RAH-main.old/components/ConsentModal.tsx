import React from 'react';

interface ConsentModalProps {
  onConsent: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ onConsent }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-black/80 border-2 border-[var(--color-neon-pink)] rounded-lg p-8 max-w-md text-center shadow-2xl shadow-pink-500/20">
        <h1 className="text-2xl font-orbitron font-bold text-[var(--color-neon-pink)] mb-4 animated-title-glow">CYBERSEC COMMAND</h1>
        <p className="text-gray-300 mb-6">
          This is a mock surveillance system for demonstration purposes. Video feeds are from public test streams and do not represent actual surveillance footage. By proceeding, you acknowledge the nature of this demo.
        </p>
        <button
          onClick={onConsent}
          className="w-full bg-[var(--color-neon-cyan)] text-black font-bold py-3 px-6 rounded-md hover:bg-cyan-300 transition-all duration-300 neon-glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
        >
          Acknowledge & Proceed
        </button>
      </div>
    </div>
  );
};
