import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import mongoose from 'mongoose';
import {
  generateSecureTemporaryPassword,
  sendStudentCredentialsEmail,
} from '../utils/emailService.js';
import { createNotification } from '../utils/notificationService.js';

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

// @desc    Admin bulk imports multiple students
// @route   POST /api/admin/students/bulk-import
// @access  Private (ADMIN only)
export const adminBulkImportStudents = async (req, res, next) => {
  try {
    const { students = [], autoGeneratePasswords = true, defaultPassword } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No student records provided for import.',
      });
    }

    if (students.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 500 students can be imported in a single batch.',
      });
    }

    const createdStudents = [];
    const failedRecords = [];
    let emailsSentCount = 0;
    let emailsFailedCount = 0;

    const seenEmailsInBatch = new Set();
    const seenRegNumsInBatch = new Set();

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      const rowIndex = row.rowNumber || (i + 1);
      const name = (row.name || '').trim();
      const email = (row.email || '').toLowerCase().trim();
      const registerNumber = (row.registerNumber || '').trim();
      const department = (row.department || '').trim();
      const academicYear = (row.academicYear || row.batch || '').trim();

      // Determine password: generate unique secure random temporary password by default
      let tempPassword = '';
      if (row.password && String(row.password).trim().length >= 6) {
        tempPassword = String(row.password).trim();
      } else if (defaultPassword && String(defaultPassword).trim().length >= 6 && !autoGeneratePasswords) {
        tempPassword = String(defaultPassword).trim();
      } else {
        tempPassword = generateSecureTemporaryPassword();
      }

      // Validate required name
      if (!name || name.length < 2) {
        failedRecords.push({
          row: rowIndex,
          name: name || '—',
          email: email || '—',
          registerNumber: registerNumber || '—',
          reason: 'Full name is required (minimum 2 characters).',
        });
        continue;
      }

      // Validate email format
      if (!email || !emailRegex.test(email)) {
        failedRecords.push({
          row: rowIndex,
          name,
          email: email || '—',
          registerNumber: registerNumber || '—',
          reason: 'Valid email address format is required.',
        });
        continue;
      }

      // Check intra-batch duplicate email
      if (seenEmailsInBatch.has(email)) {
        failedRecords.push({
          row: rowIndex,
          name,
          email,
          registerNumber: registerNumber || '—',
          reason: 'Duplicate email address within this import file.',
        });
        continue;
      }

      // Check intra-batch duplicate register number
      if (registerNumber && seenRegNumsInBatch.has(registerNumber.toLowerCase())) {
        failedRecords.push({
          row: rowIndex,
          name,
          email,
          registerNumber,
          reason: 'Duplicate register number within this import file.',
        });
        continue;
      }

      // Check if email already exists in system
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        failedRecords.push({
          row: rowIndex,
          name,
          email,
          registerNumber: registerNumber || '—',
          reason: `Account already registered with email: ${email}`,
        });
        continue;
      }

      // Check if register number already exists in system
      if (registerNumber) {
        const existingProfile = await StudentProfile.findOne({ registerNumber });
        if (existingProfile) {
          failedRecords.push({
            row: rowIndex,
            name,
            email,
            registerNumber,
            reason: `Student profile already exists with register number: ${registerNumber}`,
          });
          continue;
        }
      }

      // Valid record — record in seen sets
      seenEmailsInBatch.add(email);
      if (registerNumber) {
        seenRegNumsInBatch.add(registerNumber.toLowerCase());
      }

      try {
        // Create User with STUDENT role and mustChangePassword flag set to true
        // Plaintext is NEVER stored in database; User.create hashes password via bcrypt
        const user = await User.create({
          name,
          email,
          password: tempPassword,
          role: 'STUDENT',
          mustChangePassword: true,
        });

        // Create pre-filled StudentProfile
        const profile = await StudentProfile.create({
          user: user._id,
          department,
          batch: academicYear,
          registerNumber,
          academicYear,
          phone: (row.phone || '').trim(),
          cgpa: typeof row.cgpa === 'number' ? row.cgpa : (parseFloat(row.cgpa) || null),
          backlogs: typeof row.backlogs === 'number' ? row.backlogs : (parseInt(row.backlogs, 10) || 0),
          bio: '',
          skills: [],
          projects: [],
          certifications: [],
          resume: { url: '', fileName: '', updatedAt: null },
        });

        // Dispatch onboarding email with login credentials safely
        const emailResult = await sendStudentCredentialsEmail({
          to: user.email,
          studentName: user.name,
          temporaryPassword: tempPassword,
          registerNumber: profile.registerNumber,
        });

        if (emailResult.success) {
          emailsSentCount++;
        } else {
          emailsFailedCount++;
        }

        createdStudents.push({
          _id: user._id,
          name: user.name,
          email: user.email,
          registerNumber: profile.registerNumber,
          department: profile.department,
          academicYear: profile.academicYear,
          mustChangePassword: true,
          emailSent: emailResult.success,
          emailMode: emailResult.mode,
        });
      } catch (err) {
        failedRecords.push({
          row: rowIndex,
          name,
          email,
          registerNumber: registerNumber || '—',
          reason: err.message || 'Database creation failure.',
        });
      }
    }

    const total = students.length;
    const successfulCount = createdStudents.length;
    const failedCount = failedRecords.length;

    // Notify administrators about bulk import completion
    createNotification({
      targetRole: 'ADMIN',
      title: 'Bulk Student Import Processed',
      message: `Batch import completed: ${successfulCount} student accounts created, ${emailsSentCount} onboarding emails sent.${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
      type: 'SYSTEM_ALERT',
      link: '/admin/bulk-import',
      metadata: { successfulCount, failedCount, emailsSent: emailsSentCount },
    }).catch((e) => console.error('[Notification Trigger]', e.message));

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${successfulCount} accounts created, ${emailsSentCount} onboarding emails sent. ${failedCount > 0 ? `${failedCount} failed.` : ''}`,
      summary: {
        total,
        successfulCount,
        failedCount,
        emailsSent: emailsSentCount,
        emailsFailed: emailsFailedCount,
      },
      createdStudents,
      failedRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin resends credentials with a freshly generated temporary password
// @route   POST /api/admin/students/:id/resend-credentials
// @access  Private (ADMIN only)
export const adminResendStudentCredentials = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    const profile = await StudentProfile.findOne({ user: id });

    // Generate new unique secure temporary password
    const newTempPassword = generateSecureTemporaryPassword();

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newTempPassword, salt);

    // Update password and enforce mustChangePassword = true
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      mustChangePassword: true,
    });

    // Send email with credentials
    const emailResult = await sendStudentCredentialsEmail({
      to: user.email,
      studentName: user.name,
      temporaryPassword: newTempPassword,
      registerNumber: profile?.registerNumber || '',
    });

    res.status(200).json({
      success: true,
      message: emailResult.success
        ? `New temporary password generated and onboarding email dispatched to ${user.email}.`
        : `New password generated, but email service reported: ${emailResult.error || 'Check SMTP configuration.'}`,
      emailSent: emailResult.success,
      emailMode: emailResult.mode,
    });
  } catch (error) {
    next(error);
  }
};


