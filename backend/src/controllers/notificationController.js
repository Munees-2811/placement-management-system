import Notification from '../models/Notification.js';
import { registerSSEClient } from '../utils/notificationService.js';

/**
 * Helper to compute per-user read/deleted status for a notification
 */
const formatNotificationForUser = (notif, userId) => {
  const plain = typeof notif.toObject === 'function' ? notif.toObject() : { ...notif };
  const strUserId = String(userId);

  // A notification is read if:
  // 1. It is directly addressed to this user and isRead is true, OR
  // 2. It is a role broadcast and readBy contains this user's ID
  const isRead = plain.recipient
    ? Boolean(plain.isRead)
    : Array.isArray(plain.readBy) && plain.readBy.some((id) => String(id) === strUserId);

  // A notification is deleted for this user if:
  const isDeleted = Array.isArray(plain.deletedBy) &&
    plain.deletedBy.some((id) => String(id) === strUserId);

  return {
    ...plain,
    isRead,
    isDeleted,
  };
};

/**
 * @desc    Get current user's notifications (supports filter: 'all', 'unread', 'read')
 * @route   GET /api/notifications
 * @access  Private (All authenticated roles)
 */
export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = (req.user.role || 'STUDENT').toUpperCase();
    const { filter = 'all', limit = 50 } = req.query;

    const query = {
      $or: [
        { recipient: userId },
        { targetRole: userRole },
        { targetRole: 'ALL' },
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    const formatted = (notifications || [])
      .map((n) => formatNotificationForUser(n, userId))
      .filter((n) => !n.isDeleted);

    const unreadCount = formatted.filter((n) => !n.isRead).length;

    let filteredList = formatted;
    if (filter === 'unread') {
      filteredList = formatted.filter((n) => !n.isRead);
    } else if (filter === 'read') {
      filteredList = formatted.filter((n) => n.isRead);
    }

    const limited = filteredList.slice(0, parseInt(limit, 10) || 50);

    res.status(200).json({
      success: true,
      count: limited.length,
      totalCount: formatted.length,
      unreadCount,
      data: limited,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get count of unread notifications
 * @route   GET /api/notifications/unread-count
 * @access  Private (All authenticated roles)
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = (req.user.role || 'STUDENT').toUpperCase();

    const query = {
      $or: [
        { recipient: userId },
        { targetRole: userRole },
        { targetRole: 'ALL' },
      ],
    };

    const notifications = await Notification.find(query);
    const formatted = (notifications || [])
      .map((n) => formatNotificationForUser(n, userId))
      .filter((n) => !n.isDeleted);

    const unreadCount = formatted.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notif.recipient && String(notif.recipient) === String(userId)) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, {
        $addToSet: { readBy: userId },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user's notifications as read
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = (req.user.role || 'STUDENT').toUpperCase();

    const query = {
      $or: [
        { recipient: userId },
        { targetRole: userRole },
        { targetRole: 'ALL' },
      ],
    };

    const notifications = await Notification.find(query);

    for (const n of notifications || []) {
      const f = formatNotificationForUser(n, userId);
      if (!f.isRead && !f.isDeleted) {
        if (n.recipient && String(n.recipient) === String(userId)) {
          await Notification.findByIdAndUpdate(n._id, { isRead: true });
        } else {
          await Notification.findByIdAndUpdate(n._id, {
            $addToSet: { readBy: userId },
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete single notification for the current user
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notif.recipient && String(notif.recipient) === String(userId)) {
      await Notification.findByIdAndDelete(id);
    } else {
      await Notification.findByIdAndUpdate(id, {
        $addToSet: { deletedBy: userId },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all read notifications for current user
 * @route   DELETE /api/notifications/clear-all
 * @access  Private
 */
export const clearAllReadNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = (req.user.role || 'STUDENT').toUpperCase();

    const query = {
      $or: [
        { recipient: userId },
        { targetRole: userRole },
        { targetRole: 'ALL' },
      ],
    };

    const notifications = await Notification.find(query);

    for (const n of notifications || []) {
      const f = formatNotificationForUser(n, userId);
      if (f.isRead && !f.isDeleted) {
        if (n.recipient && String(n.recipient) === String(userId)) {
          await Notification.findByIdAndDelete(n._id);
        } else {
          await Notification.findByIdAndUpdate(n._id, {
            $addToSet: { deletedBy: userId },
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'All read notifications cleared',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Real-time Server-Sent Events stream for instant notification updates
 * @route   GET /api/notifications/stream
 * @access  Private (Authenticated)
 */
export const streamNotifications = (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role || 'STUDENT';
  registerSSEClient(userId, userRole, res);
};

