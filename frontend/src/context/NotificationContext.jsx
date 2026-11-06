import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  clearAllReadNotifications as apiClearAllRead,
} from '../api/notificationApi';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null);

  const eventSourceRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Quiet fail on polling
    }
  }, [isAuthenticated]);

  // Fetch full notifications list
  const fetchNotifications = useCallback(
    async (params = { filter: 'all', limit: 50 }) => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const res = await getNotifications(params);
        setNotifications(res.data?.data || []);
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (err) {
        console.error('[NotificationContext] Failed to load notifications:', err.message);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      await apiMarkAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('[NotificationContext] Mark as read failed:', err.message);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationContext] Mark all as read failed:', err.message);
    }
  };

  // Delete notification
  const removeNotification = async (id) => {
    try {
      await apiDeleteNotification(id);
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error('[NotificationContext] Delete failed:', err.message);
    }
  };

  // Clear all read
  const clearAllRead = async () => {
    try {
      await apiClearAllRead();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.error('[NotificationContext] Clear read failed:', err.message);
    }
  };

  // Setup periodic polling (every 10s) and initial load
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();
    fetchNotifications({ filter: 'all', limit: 20 });

    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications]);

  // Setup real-time updates via EventSource if supported
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Connect SSE using backend stream URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    // Native EventSource does not support custom headers in browser, so we poll reliably every 10s
    // And when window regains focus, we immediately refresh:
    const handleFocus = () => {
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, token, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllRead,
        latestAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

