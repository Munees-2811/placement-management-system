import mongoose from 'mongoose';
import { localApplicationStore } from './applicationStore.js';

export const APPLICATION_STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student applicant reference is required'],
      index: true,
    },
    placementDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Placement drive reference is required'],
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: '{VALUE} is not a valid application status',
      },
      default: 'APPLIED',
      uppercase: true,
      trim: true,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same student for the same placement drive
applicationSchema.index({ student: 1, placementDrive: 1 }, { unique: true });

const MongooseApplication = mongoose.model('Application', applicationSchema);

// Hybrid Model: transparently uses MongoDB when connected, falls back to localApplicationStore
const Application = {
  get schema() {
    return MongooseApplication.schema;
  },

  find(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseApplication.find(...args);
    }
    return localApplicationStore.find(...args);
  },

  findById(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseApplication.findById(...args);
    }
    return localApplicationStore.findById(...args);
  },

  findOne(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseApplication.findOne(...args);
    }
    return localApplicationStore.findOne(...args);
  },

  create(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseApplication.create(...args);
    }
    return localApplicationStore.create(...args);
  },

  findByIdAndUpdate(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseApplication.findByIdAndUpdate(...args);
    }
    return localApplicationStore.findByIdAndUpdate(...args);
  },

  findByIdAndDelete(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseApplication.findByIdAndDelete(...args);
    }
    return localApplicationStore.findByIdAndDelete(...args);
  },

  countDocuments(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseApplication.countDocuments(...args);
    }
    return localApplicationStore.countDocuments(...args);
  },
};

export { applicationSchema, MongooseApplication };
export default Application;
