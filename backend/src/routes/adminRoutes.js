import express from 'express';
import { adminCreateStudent, adminListStudents } from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(protect);
router.use(authorizeRoles('ADMIN'));

router.route('/students')
  .get(adminListStudents)
  .post(adminCreateStudent);

export default router;

