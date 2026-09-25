import Application, { APPLICATION_STATUSES } from '../models/Application.js';
import PlacementDrive from '../models/PlacementDrive.js';
import StudentProfile from '../models/StudentProfile.js';
import { checkEligibility } from '../utils/eligibilityEngine.js';

/**
 * @desc    Apply to a placement drive
 * @route   POST /api/applications/apply
 * @access  Private (STUDENT only)
 */
export const applyToPlacementDrive = async (req, res, next) => {
  try {
    // 1. Authorization: Only students can apply
    if (req.user?.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Only registered students can apply for placement drives',
      });
    }

    const { placementDrive: driveId, remarks = '' } = req.body;

    if (!driveId) {
      return res.status(400).json({
        success: false,
        message: 'Placement drive ID is required',
      });
    }

    // 2. Fetch Drive & Validate State
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found',
      });
    }

    // Drive status check
    const driveStatus = (drive.status || '').toUpperCase();
    if (driveStatus === 'COMPLETED' || driveStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Applications are closed because this drive is marked as ${driveStatus}`,
      });
    }

    // Deadline check
    if (drive.applicationDeadline) {
      const deadline = new Date(drive.applicationDeadline).getTime();
      if (deadline < Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'The application deadline for this placement drive has already passed',
        });
      }
    }

    // 3. Prevent Duplicate Applications
    const studentId = req.user._id.toString();
    const existingApplication = await Application.findOne({
      student: studentId,
      placementDrive: driveId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this placement drive',
        data: existingApplication,
      });
    }

    // 4. Fetch Student Profile and Backend Eligibility Verification
    const profile = await StudentProfile.findOne({ user: studentId });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your student profile before applying for placement drives',
      });
    }

    const eligibility = checkEligibility(profile, drive);
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: 'You do not meet the eligibility criteria for this placement drive',
        reasons: eligibility.reasons,
        criteria: eligibility.criteria,
      });
    }

    // 5. Create Application
    const application = await Application.create({
      student: studentId,
      placementDrive: driveId,
      appliedAt: new Date(),
      status: 'APPLIED',
      remarks: remarks.trim(),
    });

    return res.status(201).json({
      success: true,
      message: `Successfully applied for ${drive.jobRole} at ${drive.company?.companyName || 'Corporate Partner'}`,
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this placement drive',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get applications of currently logged in student
 * @route   GET /api/applications/my
 * @access  Private (STUDENT only)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const { status } = req.query;

    const query = { student: studentId };
    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    const applications = await Application.find(query)
      .populate('placementDrive')
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications (with search, drive filter, status filter)
 * @route   GET /api/applications
 * @access  Private (PLACEMENT_OFFICER, ADMIN)
 */
export const getAllApplications = async (req, res, next) => {
  try {
    // If student calls this, redirect to their own applications
    if (req.user?.role === 'STUDENT') {
      return getMyApplications(req, res, next);
    }

    const { driveId, placementDrive, status, search } = req.query;

    let query = {};

    const targetDrive = driveId || placementDrive;
    if (targetDrive && targetDrive !== 'ALL') {
      query.placementDrive = targetDrive;
    }

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    let applications = await Application.find(query)
      .populate('student')
      .populate('placementDrive')
      .sort({ appliedAt: -1 });

    // In-memory search filtering if keyword provided
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      applications = applications.filter((app) => {
        const studentName = app.student?.name || '';
        const studentEmail = app.student?.email || '';
        const dept = app.student?.profile?.department || '';
        const jobRole = app.placementDrive?.jobRole || '';
        const companyName = app.placementDrive?.company?.companyName || '';

        return (
          studentName.toLowerCase().includes(q) ||
          studentEmail.toLowerCase().includes(q) ||
          dept.toLowerCase().includes(q) ||
          jobRole.toLowerCase().includes(q) ||
          companyName.toLowerCase().includes(q)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application by ID
 * @route   GET /api/applications/:id
 * @access  Private (All authenticated roles, students restricted to their own)
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id)
      .populate('student')
      .populate('placementDrive');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Role check: Students can only view their own applications
    if (req.user?.role === 'STUDENT') {
      const appStudentId = String(application.student?._id || application.student);
      if (appStudentId !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this application',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status and remarks
 * @route   PATCH /api/applications/:id/status
 * @access  Private (PLACEMENT_OFFICER, ADMIN)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const existing = await Application.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const updates = {};
    if (status) {
      const normalizedStatus = status.trim().toUpperCase();
      if (!APPLICATION_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}`,
        });
      }
      updates.status = normalizedStatus;
    }

    if (remarks !== undefined) {
      updates.remarks = remarks.trim();
    }

    const updated = await Application.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${updated.status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick Shortlist application
 * @route   PATCH /api/applications/:id/shortlist
 * @access  Private (PLACEMENT_OFFICER, ADMIN)
 */
export const shortlistApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const existing = await Application.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const updates = { status: 'SHORTLISTED' };
    if (remarks !== undefined) {
      updates.remarks = remarks.trim();
    }

    const updated = await Application.findByIdAndUpdate(id, updates, { new: true });

    return res.status(200).json({
      success: true,
      message: 'Student shortlisted successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick Reject application
 * @route   PATCH /api/applications/:id/reject
 * @access  Private (PLACEMENT_OFFICER, ADMIN)
 */
export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const existing = await Application.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const updates = { status: 'REJECTED' };
    if (remarks !== undefined) {
      updates.remarks = remarks.trim();
    }

    const updated = await Application.findByIdAndUpdate(id, updates, { new: true });

    return res.status(200).json({
      success: true,
      message: 'Application marked as rejected',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get summary stats of applications
 * @route   GET /api/applications/stats
 * @access  Private (All authenticated roles)
 */
export const getApplicationStats = async (req, res, next) => {
  try {
    const isStudent = req.user?.role === 'STUDENT';
    const query = isStudent ? { student: req.user._id.toString() } : {};

    const allApps = await Application.find(query);

    const breakdown = {
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    };

    allApps.forEach((app) => {
      const s = (app.status || 'APPLIED').toUpperCase();
      if (breakdown[s] !== undefined) {
        breakdown[s]++;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        total: allApps.length,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
