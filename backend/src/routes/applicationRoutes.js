import express from 'express';
import {
  applyToPlacementDrive,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  shortlistApplication,
  rejectApplication,
  getApplicationStats,
} from '../controllers/applicationController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  validateApplicationApply,
  validateApplicationStatusUpdate,
} from '../middlewares/applicationValidation.js';

const router = express.Router();

// All application routes require authentication
router.use(protect);

// ── Application Stats ─────────────────────────────────────────
router.get('/stats', getApplicationStats);

// ── Student-Specific Routes ───────────────────────────────────
router.post(
  '/apply',
  authorizeRoles('STUDENT'),
  validateApplicationApply,
  applyToPlacementDrive
);

router.post(
  '/',
  authorizeRoles('STUDENT'),
  validateApplicationApply,
  applyToPlacementDrive
);

router.get('/my', authorizeRoles('STUDENT'), getMyApplications);

// ── General & Officer Routes ──────────────────────────────────
router.get('/', getAllApplications);

router.get('/:id', getApplicationById);

// ── Officer Status & Remarks Management ───────────────────────
router.patch(
  '/:id/status',
  authorizeRoles('PLACEMENT_OFFICER', 'ADMIN'),
  validateApplicationStatusUpdate,
  updateApplicationStatus
);

router.put(
  '/:id/status',
  authorizeRoles('PLACEMENT_OFFICER', 'ADMIN'),
  validateApplicationStatusUpdate,
  updateApplicationStatus
);

router.patch(
  '/:id/shortlist',
  authorizeRoles('PLACEMENT_OFFICER', 'ADMIN'),
  shortlistApplication
);

router.patch(
  '/:id/reject',
  authorizeRoles('PLACEMENT_OFFICER', 'ADMIN'),
  rejectApplication
);

export default router;
