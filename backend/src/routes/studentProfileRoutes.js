import express from 'express';
import {
  getMyProfile,
  updateBasicProfile,
  updateSkills,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  updateCertification,
  deleteCertification,
  updateResume,
  deleteResume,
  uploadResumeFile,
} from '../controllers/studentProfileController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadResume } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// All routes are private and require JWT authentication
router.use(protect);

router.route('/')
  .get(getMyProfile)
  .put(updateBasicProfile);

router.route('/skills')
  .put(updateSkills);

router.route('/projects')
  .post(addProject);

router.route('/projects/:projectId')
  .put(updateProject)
  .delete(deleteProject);

router.route('/certifications')
  .post(addCertification);

router.route('/certifications/:certId')
  .put(updateCertification)
  .delete(deleteCertification);

router.route('/resume')
  .post(updateResume)
  .delete(deleteResume);

// PDF file upload route
router.post('/resume/upload', uploadResume, uploadResumeFile);

export default router;
