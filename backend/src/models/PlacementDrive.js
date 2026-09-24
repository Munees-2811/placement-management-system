import mongoose from 'mongoose';
import { localPlacementDriveStore } from './placementDriveStore.js';

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please select an associated company for the drive'],
      index: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      minlength: [2, 'Job role must be at least 2 characters long'],
      maxlength: [120, 'Job role cannot exceed 120 characters'],
      index: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: [4000, 'Job description cannot exceed 4000 characters'],
    },
    salaryPackage: {
      type: String,
      required: [true, 'Salary package details are required'],
      trim: true,
      maxlength: [100, 'Salary package description cannot exceed 100 characters'],
    },
    eligibleDepartments: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one eligible department must be specified',
      },
    },
    minimumCGPA: {
      type: Number,
      required: [true, 'Minimum CGPA threshold is required'],
      min: [0, 'Minimum CGPA cannot be negative'],
      max: [10, 'Minimum CGPA cannot exceed 10.0'],
      default: 0,
    },
    maximumBacklogs: {
      type: Number,
      required: [true, 'Maximum allowed backlogs is required'],
      min: [0, 'Maximum backlogs cannot be negative'],
      default: 0,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Eligible graduation year is required'],
      min: [2020, 'Graduation year must be 2020 or later'],
      max: [2035, 'Graduation year cannot exceed 2035'],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline date is required'],
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
        message: '{VALUE} is not a supported drive status',
      },
      default: 'UPCOMING',
      uppercase: true,
      trim: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filters
placementDriveSchema.index({ jobRole: 'text', jobDescription: 'text' });
placementDriveSchema.index({ status: 1, driveDate: 1 });

const MongoosePlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);

// Hybrid Model: uses MongoDB when connected, transparently falls back to localPlacementDriveStore
const PlacementDrive = {
  get schema() {
    return MongoosePlacementDrive.schema;
  },

  find(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlacementDrive.find(...args);
    }
    return localPlacementDriveStore.find(...args);
  },

  findById(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlacementDrive.findById(...args);
    }
    return localPlacementDriveStore.findById(...args);
  },

  findOne(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlacementDrive.findOne(...args);
    }
    return localPlacementDriveStore.findOne(...args);
  },

  create(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlacementDrive.create(...args);
    }
    return localPlacementDriveStore.create(...args);
  },

  findByIdAndUpdate(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlacementDrive.findByIdAndUpdate(...args);
    }
    return localPlacementDriveStore.findByIdAndUpdate(...args);
  },

  findByIdAndDelete(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlacementDrive.findByIdAndDelete(...args);
    }
    return localPlacementDriveStore.findByIdAndDelete(...args);
  },

  countDocuments(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlacementDrive.countDocuments(...args);
    }
    return localPlacementDriveStore.countDocuments(...args);
  },
};

export { placementDriveSchema, MongoosePlacementDrive };
export default PlacementDrive;
