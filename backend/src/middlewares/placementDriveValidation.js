export const validatePlacementDriveInput = (data, isUpdate = false) => {
  const errors = [];
  const sanitized = {};

  // Company
  if (!isUpdate || data.company !== undefined) {
    if (!data.company || (typeof data.company === 'string' && data.company.trim() === '')) {
      errors.push({ field: 'company', message: 'Associated company is required' });
    } else {
      sanitized.company = typeof data.company === 'object' ? data.company._id : data.company.trim();
    }
  }

  // Job Role
  if (!isUpdate || data.jobRole !== undefined) {
    if (!data.jobRole || typeof data.jobRole !== 'string' || data.jobRole.trim() === '') {
      errors.push({ field: 'jobRole', message: 'Job role is required' });
    } else if (data.jobRole.trim().length < 2) {
      errors.push({ field: 'jobRole', message: 'Job role must be at least 2 characters long' });
    } else if (data.jobRole.trim().length > 120) {
      errors.push({ field: 'jobRole', message: 'Job role cannot exceed 120 characters' });
    } else {
      sanitized.jobRole = data.jobRole.trim();
    }
  }

  // Job Description
  if (!isUpdate || data.jobDescription !== undefined) {
    if (!data.jobDescription || typeof data.jobDescription !== 'string' || data.jobDescription.trim() === '') {
      errors.push({ field: 'jobDescription', message: 'Job description is required' });
    } else if (data.jobDescription.trim().length > 4000) {
      errors.push({ field: 'jobDescription', message: 'Job description cannot exceed 4000 characters' });
    } else {
      sanitized.jobDescription = data.jobDescription.trim();
    }
  }

  // Salary Package
  if (!isUpdate || data.salaryPackage !== undefined) {
    if (!data.salaryPackage || typeof data.salaryPackage !== 'string' || data.salaryPackage.trim() === '') {
      errors.push({ field: 'salaryPackage', message: 'Salary package details are required' });
    } else if (data.salaryPackage.trim().length > 100) {
      errors.push({ field: 'salaryPackage', message: 'Salary package cannot exceed 100 characters' });
    } else {
      sanitized.salaryPackage = data.salaryPackage.trim();
    }
  }

  // Eligible Departments
  if (!isUpdate || data.eligibleDepartments !== undefined) {
    let depts = data.eligibleDepartments;
    if (typeof depts === 'string') {
      depts = depts.split(',').map((d) => d.trim()).filter(Boolean);
    }
    if (!Array.isArray(depts) || depts.length === 0) {
      errors.push({ field: 'eligibleDepartments', message: 'At least one eligible department must be selected' });
    } else {
      sanitized.eligibleDepartments = depts.map((d) => String(d).trim()).filter(Boolean);
    }
  }

  // Minimum CGPA
  if (!isUpdate || data.minimumCGPA !== undefined) {
    const cgpa = Number(data.minimumCGPA);
    if (data.minimumCGPA === undefined || data.minimumCGPA === null || isNaN(cgpa)) {
      errors.push({ field: 'minimumCGPA', message: 'A valid minimum CGPA is required' });
    } else if (cgpa < 0 || cgpa > 10) {
      errors.push({ field: 'minimumCGPA', message: 'Minimum CGPA must be between 0.0 and 10.0' });
    } else {
      sanitized.minimumCGPA = Number(cgpa.toFixed(2));
    }
  }

  // Maximum Backlogs
  if (!isUpdate || data.maximumBacklogs !== undefined) {
    const backlogs = Number(data.maximumBacklogs);
    if (data.maximumBacklogs === undefined || data.maximumBacklogs === null || isNaN(backlogs) || backlogs < 0) {
      errors.push({ field: 'maximumBacklogs', message: 'Maximum allowed backlogs must be 0 or a positive number' });
    } else {
      sanitized.maximumBacklogs = Math.floor(backlogs);
    }
  }

  // Graduation Year
  if (!isUpdate || data.graduationYear !== undefined) {
    const year = Number(data.graduationYear);
    if (isNaN(year) || year < 2020 || year > 2035) {
      errors.push({ field: 'graduationYear', message: 'Graduation year must be between 2020 and 2035' });
    } else {
      sanitized.graduationYear = Math.floor(year);
    }
  }

  // Application Deadline
  if (!isUpdate || data.applicationDeadline !== undefined) {
    const deadline = new Date(data.applicationDeadline);
    if (!data.applicationDeadline || isNaN(deadline.getTime())) {
      errors.push({ field: 'applicationDeadline', message: 'Please provide a valid application deadline date' });
    } else {
      sanitized.applicationDeadline = deadline.toISOString();
    }
  }

  // Drive Date
  if (!isUpdate || data.driveDate !== undefined) {
    const dDate = new Date(data.driveDate);
    if (!data.driveDate || isNaN(dDate.getTime())) {
      errors.push({ field: 'driveDate', message: 'Please provide a valid drive date' });
    } else {
      sanitized.driveDate = dDate.toISOString();
    }
  }

  // Status (optional)
  if (data.status !== undefined) {
    const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
    const s = String(data.status).trim().toUpperCase();
    if (!validStatuses.includes(s)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    } else {
      sanitized.status = s;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

export const validatePlacementDrive = (req, res, next) => {
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';

  if (isUpdate && (!req.body || Object.keys(req.body).length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide fields to update',
    });
  }

  const { isValid, errors, sanitized } = validatePlacementDriveInput(req.body, isUpdate);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0]?.message || 'Validation failed for placement drive',
      errors,
    });
  }

  req.body = { ...req.body, ...sanitized };
  next();
};
