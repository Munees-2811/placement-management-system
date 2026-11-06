import Notification from '../models/Notification.js';

// Connected SSE clients: Map of clientId -> { userId, role, res }
const activeSSEClients = new Map();

/**
 * Register a client for Server-Sent Events real-time notification stream
 */
export const registerSSEClient = (userId, role, res) => {
  const clientId = `${String(userId)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Set SSE response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Flush initial connection acknowledgment
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date() })}\n\n`);

  activeSSEClients.set(clientId, {
    userId: String(userId),
    role: role ? String(role).toUpperCase() : 'STUDENT',
    res,
  });

  // Heartbeat keep-alive every 25 seconds
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeatTimer);
    }
  }, 25000);

  // Clean up on disconnect
  res.on('close', () => {
    clearInterval(heartbeatTimer);
    activeSSEClients.delete(clientId);
  });
};

/**
 * Broadcast notification payload to matching SSE clients
 */
const broadcastToClients = (notification) => {
  const recipientId = notification.recipient ? String(notification.recipient) : null;
  const targetRole = notification.targetRole ? String(notification.targetRole).toUpperCase() : null;

  for (const [, client] of activeSSEClients.entries()) {
    let shouldSend = false;

    if (recipientId && client.userId === recipientId) {
      shouldSend = true;
    } else if (!recipientId && (targetRole === 'ALL' || client.role === targetRole)) {
      shouldSend = true;
    }

    if (shouldSend) {
      try {
        client.res.write(`event: notification\ndata: ${JSON.stringify(notification)}\n\n`);
      } catch (err) {
        console.error('[SSE] Failed to write to client:', err.message);
      }
    }
  }
};

/**
 * Create a notification record and push in real-time
 */
export const createNotification = async ({
  recipient = null,
  targetRole = null,
  title,
  message,
  type = 'GENERAL',
  link = '',
  metadata = {},
}) => {
  try {
    const notif = await Notification.create({
      recipient: recipient ? String(recipient) : null,
      targetRole: targetRole ? String(targetRole).toUpperCase() : null,
      title,
      message,
      type,
      link,
      isRead: false,
      readBy: [],
      deletedBy: [],
      metadata,
    });

    // Push real-time event to active clients
    broadcastToClients(notif);

    return notif;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
};

