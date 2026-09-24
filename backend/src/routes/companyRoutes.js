import express from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validateCompany } from '../middlewares/companyValidation.js';

const router = express.Router();

// All company routes require authentication (Students, Officers, Admins)
router.use(protect);

// Read-only routes accessible to all authenticated roles including STUDENT
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Write routes restricted strictly to ADMIN and PLACEMENT_OFFICER
router.post(
  '/',
  authorizeRoles('ADMIN', 'PLACEMENT_OFFICER'),
  validateCompany,
  createCompany
);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'PLACEMENT_OFFICER'),
  validateCompany,
  updateCompany
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN', 'PLACEMENT_OFFICER'),
  deleteCompany
);

export default router;
