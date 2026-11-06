import api from './axios';

/**
 * Fetch current user's notifications
 * @param {Object} params
 * @param {string} [params.filter='all'] - 'all' | 'unread' | 'read'
 * @param {number} [params.limit=50]
 */
export const getNotifications = (params = {}) =>
  api.get('/notifications', { params });

/**
 * Fetch total unread notifications count
 */
export const getUnreadCount = () =>
  api.get('/notifications/unread-count');

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = (id) =>
  api.patch(`/notifications/${id}/read`);

/**
 * Mark all user notifications as read
 */
export const markAllNotificationsAsRead = () =>
  api.patch('/notifications/mark-all-read');

/**
 * Delete a single notification
 */
export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

/**
 * Clear all read notifications
 */
export const clearAllReadNotifications = () =>
  api.delete('/notifications/clear-all');

