import React, { useState, useEffect } from 'react';
import type { LogEntry, Camera } from '../types';
import { CameraStatus } from '../types';

interface StatusBarProps {
  logs: LogEntry[];
  cameras: Camera[];
}

export const StatusBar: React.FC<StatusBarProps> = ({ logs, cameras }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const latestLog = logs[0];
  const onlineCount = cameras.filter(c => c.status === CameraStatus.ONLINE || c.status === CameraStatus.RECORDING).length;
  const recordingCount = cameras.filter(c => c.status === CameraStatus.RECORDING).length;

  const getLogLevelColor = (level: LogEntry['level']) => {
      switch(level) {
          case 'info': return 'text-[var(--color-neon-purple)]';
          case 'warn': return 'text-[var(--color-neon-mint)]';
          case 'error': return 'text-[var(--color-neon-pink)]';
          default: return 'text-gray-500';
      }
  }

  return (
    <footer className="flex items-center justify-between p-2 bg-black/70 border-t-2 border-[var(--color-neon-purple)] text-xs">
      <div className="flex items-center space-x-2 overflow-hidden whitespace-nowrap">
        <div className="w-2 h-2 rounded-full bg-[var(--color-neon-mint)] animate-pulse shadow-[0_0_8px_var(--color-neon-mint)]"></div>
        <span className="font-semibold text-glow-cyan">SYSTEM LOG:</span>
        {latestLog ? (
            <>
                <span className="text-[var(--color-neon-pink)]">[{latestLog.timestamp.toLocaleTimeString()}]</span>
                <span className={getLogLevelColor(latestLog.level)}>{latestLog.message}</span>
            </>
        ) : (
            <span>Awaiting system logs...</span>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center space-x-4 font-mono">
        <span>CAMERAS: {onlineCount}/{cameras.length} ONLINE</span>
        <span className="text-[var(--color-neon-pink)]">REC: {recordingCount}</span>
        <span>{currentTime.toLocaleString()}</span>
      </div>
    </footer>
  );
};
