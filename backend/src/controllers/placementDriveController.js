import PlacementDrive from '../models/PlacementDrive.js';
import Company from '../models/Company.js';
import StudentProfile from '../models/StudentProfile.js';
import { checkEligibility } from '../utils/eligibilityEngine.js';

/**
 * @desc    Get all placement drives (search, department, status filters)
 * @route   GET /api/drives
 * @access  Private (STUDENT, PLACEMENT_OFFICER, ADMIN)
 */
export const getDrives = async (req, res, next) => {
  try {
    const { search, status, department, company, sort = 'driveDate', order = 'asc' } = req.query;

    let query = {};

    // Status filter
    if (status && status !== 'All') {
      query.status = status.toUpperCase();
    }

    // Company filter
    if (company && company !== 'All') {
      query.company = company;
    }

    // Department filter
    if (department && department !== 'All') {
      query.eligibleDepartments = department;
    }

    // Search keyword across jobRole or jobDescription
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { jobRole: searchRegex },
        { jobDescription: searchRegex },
        { salaryPackage: searchRegex },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const drives = await PlacementDrive.find(query)
      .populate('company', 'companyName industry location website contactPerson contactEmail')
      .sort(sortObj);

    return res.status(200).json({
      success: true,
      count: drives.length,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single placement drive by ID
 * @route   GET /api/drives/:id
 * @access  Private (All authenticated roles)
 */
export const getDriveById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const drive = await PlacementDrive.findById(id).populate(
      'company',
      'companyName industry location website contactPerson contactEmail description'
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new placement drive
 * @route   POST /api/drives
 * @access  Private (Restricted to PLACEMENT_OFFICER and ADMIN)
 */
export const createDrive = async (req, res, next) => {
  try {
    const {
      company,
      jobRole,
      jobDescription,
      salaryPackage,
      eligibleDepartments,
      minimumCGPA,
      maximumBacklogs,
      graduationYear,
      applicationDeadline,
      driveDate,
      status,
    } = req.body;

    // Verify company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected company does not exist in registry',
      });
    }

    const drive = await PlacementDrive.create({
      company,
      jobRole,
      jobDescription,
      salaryPackage,
      eligibleDepartments,
      minimumCGPA,
      maximumBacklogs,
      graduationYear,
      applicationDeadline,
      driveDate,
      status: status || 'UPCOMING',
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Placement drive created successfully',
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update placement drive
 * @route   PUT /api/drives/:id
 * @access  Private (Restricted to PLACEMENT_OFFICER and ADMIN)
 */
export const updateDrive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await PlacementDrive.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found',
      });
    }

    // If company is being changed, verify target company exists
    if (req.body.company && String(req.body.company) !== String(existing.company?._id || existing.company)) {
      const companyExists = await Company.findById(req.body.company);
      if (!companyExists) {
        return res.status(404).json({
          success: false,
          message: 'Specified updated company does not exist in registry',
        });
      }
    }

    const updated = await PlacementDrive.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete placement drive
 * @route   DELETE /api/drives/:id
 * @access  Private (Restricted to PLACEMENT_OFFICER and ADMIN)
 */
export const deleteDrive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await PlacementDrive.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found',
      });
    }

    await PlacementDrive.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Placement drive for "${existing.jobRole}" deleted successfully`,
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check eligibility of the currently logged-in student for a specific drive
 * @route   GET /api/drives/:id/eligibility
 * @access  Private (STUDENT only — officers/admins receive a not-applicable response)
 */
export const checkDriveEligibility = async (req, res, next) => {
  try {
    // Only meaningful for students — return a neutral result for officers/admins
    if (req.user?.role !== 'STUDENT') {
      return res.status(200).json({
        success: true,
        data: {
          eligible: null,
          summary: 'Eligibility check not applicable for this role',
          criteria: [],
          reasons: [],
          profileIncomplete: false,
          notApplicable: true,
        },
      });
    }

    const { id } = req.params;
    const drive = await PlacementDrive.findById(id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    // Fetch the student's profile
    const profile = await StudentProfile.findOne({ user: req.user._id });
    const result = checkEligibility(profile, drive);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk eligibility check — returns eligibility map for all drives for the logged-in student
 * @route   GET /api/drives/my-eligibility
 * @access  Private (STUDENT only)
 */
export const getMyEligibility = async (req, res, next) => {
  try {
    if (req.user?.role !== 'STUDENT') {
      return res.status(200).json({ success: true, data: {} });
    }

    const [drives, profile] = await Promise.all([
      PlacementDrive.find({}),
      StudentProfile.findOne({ user: req.user._id }),
    ]);

    // Build a map: driveId -> eligibility result
    const eligibilityMap = {};
    for (const drive of drives) {
      const driveId = drive._id?.toString ? drive._id.toString() : drive._id;
      eligibilityMap[driveId] = checkEligibility(profile, drive);
    }

    return res.status(200).json({ success: true, data: eligibilityMap });
  } catch (error) {
    next(error);
  }
};
