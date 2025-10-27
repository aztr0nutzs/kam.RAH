import React from 'react';
import type { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType;
  onDismiss: (id: number) => void;
}

export const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const colors = {
    info: 'border-[var(--color-neon-purple)] shadow-purple-500/20',
    success: 'border-[var(--color-neon-mint)] shadow-green-500/20',
    error: 'border-[var(--color-neon-pink)] shadow-pink-500/20',
  };

  return (
    <div 
      className={`fixed bottom-24 right-4 max-w-sm w-full bg-black/80 border-2 ${colors[notification.level]} rounded-lg p-4 shadow-2xl animate-fade-in-up z-50`}
      role="alert"
    >
      <p>{notification.message}</p>
    </div>
  );
};
