import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  toasts: Toast[];
  notifications: Toast[];
  unreadCount: number;
  addToast: (toast: Omit<Toast, 'id' | 'timestamp' | 'read'>) => void;
  removeToast: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  toasts: [],
  notifications: [],
  unreadCount: 0,
  addToast: () => {},
  removeToast: () => {},
  markAllRead: () => {},
  clearNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'timestamp' | 'read'>) => {
    const id = Math.random().toString(36).slice(2);
    const full: Toast = { ...toast, id, timestamp: new Date(), read: false };

    // Add to toasts (auto-dismiss)
    setToasts(prev => [...prev, full]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    // Add to persistent notification history
    setNotifications(prev => [full, ...prev].slice(0, 50));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      toasts, notifications, unreadCount,
      addToast, removeToast, markAllRead, clearNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};