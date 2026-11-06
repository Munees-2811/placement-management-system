import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createNotification } from '../utils/notificationService.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // Role safety check - allowed roles
    const validRoles = ['STUDENT', 'PLACEMENT_OFFICER', 'ADMIN'];
    const normalizedRole = role ? role.toUpperCase() : 'STUDENT';
    const assignedRole = validRoles.includes(normalizedRole) ? normalizedRole : 'STUDENT';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    const token = generateToken(user._id);

    // Notify administrators of new user registration
    if (user.role === 'STUDENT') {
      createNotification({
        targetRole: 'ADMIN',
        title: 'New Student Registration',
        message: `${user.name} (${user.email}) registered as a student candidate.`,
        type: 'USER_REGISTRATION',
        link: '/admin-portal',
        metadata: { userId: user._id },
      }).catch((e) => console.error('[Notification Trigger]', e.message));
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: Boolean(user.mustChangePassword),
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password (for first login temporary password or voluntary update)
// @route   POST /api/auth/change-password
// @access  Private (Authenticated)
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your temporary password.',
      });
    }

    // Find user with password selected
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = typeof user.matchPassword === 'function'
      ? await user.matchPassword(currentPassword)
      : await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    // Update password and clear mustChangePassword flag
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      mustChangePassword: false,
    });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully! You may now access the placement portal.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: false,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        mustChangePassword: Boolean(req.user.mustChangePassword),
      },
    },
  });
};
