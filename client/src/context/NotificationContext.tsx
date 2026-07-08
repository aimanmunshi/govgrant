import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '@/api/notification.api';
import { API_URL } from '@/lib/config';
import type { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // connect socket and fetch initial notifications whenever the user logs in/out
  useEffect(() => {
    if (!accessToken) {
      setNotifications([]);
      setUnreadCount(0);
      setPage(1);
      setHasMore(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const result = await getNotificationsApi(1, 20);
        if (cancelled) return;
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
        setPage(1);
        setHasMore(result.pagination.page < result.pagination.totalPages);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    const socket: Socket = io(API_URL, {
      auth: { token: accessToken },
    });

    socket.on('notification:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [accessToken]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getNotificationsApi(nextPage, 20);
      setNotifications((prev) => [...prev, ...result.notifications]);
      setPage(nextPage);
      setHasMore(result.pagination.page < result.pagination.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page]);

  const markAsRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.isRead ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => {
      const target = notifications.find((n) => n.id === id);
      return target && !target.isRead ? Math.max(0, prev - 1) : prev;
    });
    await markNotificationReadApi(id);
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsReadApi();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, hasMore, loadMore, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
