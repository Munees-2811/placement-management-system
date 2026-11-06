import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllReadNotifications,
  streamNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/stream', streamNotifications);
router.patch('/mark-all-read', markAllNotificationsAsRead);
router.delete('/clear-all', clearAllReadNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);

export default router;

