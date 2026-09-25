import { APPLICATION_STATUSES } from '../models/Application.js';

export const validateApplicationApply = (req, res, next) => {
  const { placementDrive, remarks } = req.body;
  const errors = [];

  if (!placementDrive || typeof placementDrive !== 'string' || placementDrive.trim() === '') {
    errors.push({ field: 'placementDrive', message: 'Placement drive ID is required' });
  }

  if (remarks !== undefined && remarks !== null) {
    if (typeof remarks !== 'string') {
      errors.push({ field: 'remarks', message: 'Remarks must be text' });
    } else if (remarks.trim().length > 1000) {
      errors.push({ field: 'remarks', message: 'Remarks cannot exceed 1000 characters' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors,
    });
  }

  req.body.placementDrive = placementDrive.trim();
  req.body.remarks = remarks ? remarks.trim() : '';
  next();
};

export const validateApplicationStatusUpdate = (req, res, next) => {
  const { status, remarks } = req.body;
  const errors = [];

  if (status !== undefined) {
    if (typeof status !== 'string' || !APPLICATION_STATUSES.includes(status.trim().toUpperCase())) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${APPLICATION_STATUSES.join(', ')}`,
      });
    }
  }

  if (remarks !== undefined && remarks !== null) {
    if (typeof remarks !== 'string') {
      errors.push({ field: 'remarks', message: 'Remarks must be text' });
    } else if (remarks.trim().length > 1000) {
      errors.push({ field: 'remarks', message: 'Remarks cannot exceed 1000 characters' });
    }
  }

  if (status === undefined && remarks === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide status or remarks to update',
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors,
    });
  }

  if (status !== undefined) {
    req.body.status = status.trim().toUpperCase();
  }
  if (remarks !== undefined) {
    req.body.remarks = remarks.trim();
  }

  next();
};
