import express from 'express';
import {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  checkDriveEligibility,
  getMyEligibility,
} from '../controllers/placementDriveController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validatePlacementDrive } from '../middlewares/placementDriveValidation.js';

const router = express.Router();

// All placement drive routes require authentication
router.use(protect);

// ── Eligibility routes (must come BEFORE /:id to avoid route conflicts) ──────
// Bulk: returns an eligibility map {driveId: result} for logged-in student
router.get('/my-eligibility', getMyEligibility);

// Read-only routes accessible to Students, Placement Officers, and Admins
router.get('/', getDrives);
router.get('/:id', getDriveById);

// Per-drive eligibility check for the logged-in student
router.get('/:id/eligibility', checkDriveEligibility);

// Write operations restricted strictly to PLACEMENT_OFFICER and ADMIN
router.post(
  '/',
  authorizeRoles('PLACEMENT_OFFICER', 'ADMIN'),
  validatePlacementDrive,
  createDrive
);

router.put(
  '/:id',
  authorizeRoles('PLACEMENT_OFFICER', 'ADMIN'),
  validatePlacementDrive,
  updateDrive
);

router.delete(
  '/:id',
  authorizeRoles('PLACEMENT_OFFICER', 'ADMIN'),
  deleteDrive
);

export default router;
