import mongoose from 'mongoose';
import { localStudentProfileStore, calculateCompletionPercentage } from './studentProfileStore.js';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Project title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    liveUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Certification title is required'],
      trim: true,
      maxlength: [120, 'Certification title cannot exceed 120 characters'],
    },
    issuer: {
      type: String,
      trim: true,
      maxlength: [100, 'Issuer name cannot exceed 100 characters'],
      default: '',
    },
    issueDate: {
      type: String,
      trim: true,
      default: '',
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student profile must be associated with a user'],
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/,
        'Please provide a valid phone number',
      ],
      default: '',
    },
    department: {
      type: String,
      trim: true,
      maxlength: [80, 'Department cannot exceed 80 characters'],
      default: '',
    },
    batch: {
      type: String,
      trim: true,
      maxlength: [20, 'Batch cannot exceed 20 characters'],
      default: '',
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be lower than 0.0'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    projects: [projectSchema],
    certifications: [certificationSchema],
    resume: {
      url: {
        type: String,
        trim: true,
        default: '',
      },
      fileName: {
        type: String,
        trim: true,
        default: '',
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual completion percentage & breakdown
studentProfileSchema.virtual('completionPercentage').get(function () {
  return calculateCompletionPercentage(this).percentage;
});

studentProfileSchema.virtual('completionBreakdown').get(function () {
  return calculateCompletionPercentage(this).breakdown;
});

const MongooseStudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

// Hybrid Model: transparently uses MongoDB when connected, falls back to localStudentProfileStore when offline
const StudentProfile = {
  get schema() {
    return MongooseStudentProfile.schema;
  },

  findOne(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseStudentProfile.findOne(...args);
    }
    return localStudentProfileStore.findOne(...args);
  },

  findOneAndUpdate(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseStudentProfile.findOneAndUpdate(...args);
    }
    return localStudentProfileStore.findOneAndUpdate(...args);
  },

  create(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseStudentProfile.create(...args);
    }
    return localStudentProfileStore.create(...args);
  },
};

export { calculateCompletionPercentage };
export default StudentProfile;
