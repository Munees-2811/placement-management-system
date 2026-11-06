import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'notifications.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const readNotifications = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeNotifications = (notifications) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notifications, null, 2));
};

export const localNotificationStore = {
  find(query = {}) {
    let sortField = null;

    const execute = async () => {
      let notifications = readNotifications();

      // Recipient / Role filtering
      if (query.$or) {
        // e.g. [{ recipient: userId }, { recipient: null, targetRole: userRole }, { targetRole: 'ALL' }]
        notifications = notifications.filter((n) => {
          return query.$or.some((condition) => {
            if (condition.recipient !== undefined) {
              if (String(n.recipient) === String(condition.recipient)) return true;
            }
            if (condition.targetRole) {
              if (
                (!n.recipient || n.recipient === null) &&
                (n.targetRole === condition.targetRole || n.targetRole === 'ALL')
              ) {
                return true;
              }
            }
            return false;
          });
        });
      }

      // Sort by createdAt descending
      notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return notifications;
    };

    const queryObj = {
      sort(fields) {
        sortField = fields;
        return queryObj;
      },
      then(onFulfilled, onRejected) {
        return execute().then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return execute().catch(onRejected);
      },
    };

    return queryObj;
  },

  findById(id) {
    const execute = async () => {
      const notifications = readNotifications();
      const notif = notifications.find((n) => String(n._id) === String(id));
      return notif || null;
    };

    return {
      then(onFulfilled, onRejected) {
        return execute().then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return execute().catch(onRejected);
      },
    };
  },

  async create(data) {
    const notifications = readNotifications();
    const newNotif = {
      _id: new mongoose.Types.ObjectId().toString(),
      recipient: data.recipient ? String(data.recipient) : null,
      targetRole: data.targetRole || null,
      title: data.title || '',
      message: data.message || '',
      type: data.type || 'GENERAL',
      link: data.link || '',
      isRead: Boolean(data.isRead),
      readBy: Array.isArray(data.readBy) ? data.readBy.map(String) : [],
      deletedBy: Array.isArray(data.deletedBy) ? data.deletedBy.map(String) : [],
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notifications.unshift(newNotif);
    writeNotifications(notifications);
    return newNotif;
  },

  async findByIdAndUpdate(id, updateData) {
    const notifications = readNotifications();
    const index = notifications.findIndex((n) => String(n._id) === String(id));
    if (index === -1) return null;

    const notif = notifications[index];
    const updates = updateData.$set ? updateData.$set : updateData;

    for (const key of Object.keys(updates)) {
      if (key !== '_id') {
        notif[key] = updates[key];
      }
    }

    if (updateData.$addToSet) {
      for (const [arrKey, val] of Object.entries(updateData.$addToSet)) {
        if (!Array.isArray(notif[arrKey])) notif[arrKey] = [];
        const strVal = String(val);
        if (!notif[arrKey].includes(strVal)) {
          notif[arrKey].push(strVal);
        }
      }
    }

    notif.updatedAt = new Date().toISOString();
    notifications[index] = notif;
    writeNotifications(notifications);
    return notif;
  },

  async findByIdAndDelete(id) {
    let notifications = readNotifications();
    const existing = notifications.find((n) => String(n._id) === String(id));
    if (!existing) return null;

    notifications = notifications.filter((n) => String(n._id) !== String(id));
    writeNotifications(notifications);
    return existing;
  },
};

