import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import mongoose from 'mongoose';

// @desc    Admin creates a new student account
// @route   POST /api/admin/students
// @access  Private (ADMIN only)
export const adminCreateStudent = async (req, res, next) => {
  try {
    const { name, registerNumber, email, department, academicYear, password } = req.body;

    // --- Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check duplicate email
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Check duplicate register number (in StudentProfile)
    if (registerNumber && registerNumber.trim()) {
      const regNumExists = await StudentProfile.findOne({
        registerNumber: registerNumber.trim(),
      });
      if (regNumExists) {
        return res.status(400).json({
          success: false,
          message: 'A student with this register number already exists.',
        });
      }
    }

    // --- Create User with STUDENT role ---
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'STUDENT',
    });

    // --- Create StudentProfile pre-filled with admin-provided data ---
    const profile = await StudentProfile.create({
      user: user._id,
      department: department ? department.trim() : '',
      batch: academicYear ? academicYear.trim() : '',
      registerNumber: registerNumber ? registerNumber.trim() : '',
      academicYear: academicYear ? academicYear.trim() : '',
      phone: '',
      cgpa: null,
      backlogs: 0,
      bio: '',
      skills: [],
      projects: [],
      certifications: [],
      resume: { url: '', fileName: '', updatedAt: null },
    });

    res.status(201).json({
      success: true,
      message: `Student account created successfully for ${user.name}.`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        profile: {
          _id: profile._id,
          registerNumber: profile.registerNumber,
          department: profile.department,
          academicYear: profile.academicYear,
        },
      },
    });
  } catch (error) {
    // Handle Mongoose duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `Duplicate value: a record with this ${field} already exists.`,
      });
    }
    next(error);
  }
};

// @desc    Admin lists all student users
// @route   GET /api/admin/students
// @access  Private (ADMIN only)
export const adminListStudents = async (req, res, next) => {
  try {
    // Works transparently with both MongoDB and local store
    const students = await User.find({ role: 'STUDENT' });
    const studentList = Array.isArray(students) ? students : [];

    // Extract all user IDs
    const studentIds = studentList.map((s) => String(s._id));

    // Fetch corresponding student profiles
    const profiles = await StudentProfile.find({
      user: { $in: studentIds },
    });
    const profileList = Array.isArray(profiles) ? profiles : [];

    const profileMap = {};
    profileList.forEach((p) => {
      const uId = p.user?.toString ? p.user.toString() : String(p.user);
      profileMap[uId] = p;
    });

    const result = studentList.map((s) => {
      const uId = String(s._id);
      const prof = profileMap[uId];
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        role: s.role,
        createdAt: s.createdAt,
        department: prof?.department || '',
        batch: prof?.batch || '',
        registerNumber: prof?.registerNumber || '',
        academicYear: prof?.academicYear || prof?.batch || '',
      };
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

