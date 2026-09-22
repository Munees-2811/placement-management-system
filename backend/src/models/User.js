import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { localUserStore } from './userStore.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['STUDENT', 'PLACEMENT_OFFICER', 'ADMIN'],
      default: 'STUDENT',
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare user password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);

// Hybrid User Model: Uses MongoDB when connected, transparently uses localUserStore when MongoDB is offline
const User = {
  get schema() {
    return MongooseUser.schema;
  },

  findOne(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findOne(...args);
    }
    return localUserStore.findOne(...args);
  },

  findById(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findById(...args);
    }
    return localUserStore.findById(...args);
  },

  create(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.create(...args);
    }
    return localUserStore.create(...args);
  },
};

export default User;
