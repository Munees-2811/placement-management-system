import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Verification routes for role-based authorization testing
router.get('/student-only', protect, authorizeRoles('STUDENT'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to STUDENT role protected resource',
    user: req.user,
  });
});

router.get('/officer-only', protect, authorizeRoles('PLACEMENT_OFFICER', 'ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to PLACEMENT_OFFICER / ADMIN role protected resource',
    user: req.user,
  });
});

router.get('/admin-only', protect, authorizeRoles('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to ADMIN role protected resource',
    user: req.user,
  });
});

export default router;
