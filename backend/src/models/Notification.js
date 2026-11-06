import mongoose from 'mongoose';
import { localNotificationStore } from './notificationStore.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    targetRole: {
      type: String,
      enum: ['ALL', 'STUDENT', 'PLACEMENT_OFFICER', 'ADMIN', null],
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: [
        'DRIVE_ANNOUNCED',
        'APPLICATION_STATUS',
        'NEW_APPLICATION',
        'INTERVIEW_SCHEDULED',
        'USER_REGISTRATION',
        'SYSTEM_ALERT',
        'GENERAL',
      ],
      default: 'GENERAL',
      index: true,
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user + role lookups
notificationSchema.index({ recipient: 1, targetRole: 1, createdAt: -1 });

const MongooseNotification = mongoose.model('Notification', notificationSchema);

// Hybrid Model: uses MongoDB when connected, falls back to localNotificationStore when offline
const Notification = {
  get schema() {
    return MongooseNotification.schema;
  },

  find(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.find(...args);
    }
    return localNotificationStore.find(...args);
  },

  findById(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.findById(...args);
    }
    return localNotificationStore.findById(...args);
  },

  create(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.create(...args);
    }
    return localNotificationStore.create(...args);
  },

  findByIdAndUpdate(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.findByIdAndUpdate(...args);
    }
    return localNotificationStore.findByIdAndUpdate(...args);
  },

  findByIdAndDelete(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.findByIdAndDelete(...args);
    }
    return localNotificationStore.findByIdAndDelete(...args);
  },
};

export { notificationSchema, MongooseNotification };
export default Notification;

