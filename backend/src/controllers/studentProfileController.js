import mongoose from 'mongoose';
import StudentProfile, { calculateCompletionPercentage } from '../models/StudentProfile.js';
import User from '../models/User.js';

// Helper to ensure profile exists and format with user metadata
const getOrCreateProfile = async (userId) => {
  let profile = await StudentProfile.findOne({ user: userId });

  if (!profile) {
    profile = await StudentProfile.create({
      user: userId,
      phone: '',
      department: '',
      batch: '',
      cgpa: null,
      backlogs: 0,
      bio: '',
      skills: [],
      projects: [],
      certifications: [],
      resume: {
        url: '',
        fileName: '',
        updatedAt: null,
      },
    });
  }

  // Attach user details if not populated
  const user = await User.findById(userId);
  const userObj = user ? { _id: user._id, name: user.name, email: user.email, role: user.role } : null;

  const stats = calculateCompletionPercentage(profile);

  const plainProfile = typeof profile.toObject === 'function' ? profile.toObject() : { ...profile };

  return {
    ...plainProfile,
    user: userObj,
    completionPercentage: stats.percentage,
    completionBreakdown: stats.breakdown,
  };
};

// @desc    Get current student's profile
// @route   GET /api/student/profile
// @access  Private (Authenticated)
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Student profile retrieved successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update basic academic & personal profile
// @route   PUT /api/student/profile
// @access  Private (Authenticated)
export const updateBasicProfile = async (req, res, next) => {
  try {
    const { phone, department, batch, cgpa, backlogs, bio } = req.body;

    // Validate CGPA if provided
    let parsedCgpa = null;
    if (cgpa !== undefined && cgpa !== null && cgpa !== '') {
      parsedCgpa = Number(cgpa);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        return res.status(400).json({
          success: false,
          message: 'CGPA must be a valid number between 0.0 and 10.0',
        });
      }
    }

    // Validate backlogs if provided
    let parsedBacklogs = undefined;
    if (backlogs !== undefined && backlogs !== null && backlogs !== '') {
      parsedBacklogs = Number(backlogs);
      if (isNaN(parsedBacklogs) || parsedBacklogs < 0 || !Number.isInteger(parsedBacklogs)) {
        return res.status(400).json({
          success: false,
          message: 'Backlogs must be a non-negative whole number',
        });
      }
    }

    const updates = {};
    if (phone !== undefined) updates.phone = phone.trim();
    if (department !== undefined) updates.department = department.trim();
    if (batch !== undefined) updates.batch = batch.trim();
    if (parsedCgpa !== null) updates.cgpa = parsedCgpa;
    if (cgpa === '' || cgpa === null) updates.cgpa = null;
    if (parsedBacklogs !== undefined) updates.backlogs = parsedBacklogs;
    if (bio !== undefined) updates.bio = bio.trim();

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update skills list
// @route   PUT /api/student/profile/skills
// @access  Private (Authenticated)
export const updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array of strings',
      });
    }

    // Clean, trim, and deduplicate skills
    const sanitizedSkills = [
      ...new Set(
        skills
          .filter((s) => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim())
      ),
    ];

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { skills: sanitizedSkills } },
      { new: true, upsert: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a project
// @route   POST /api/student/profile/projects
// @access  Private (Authenticated)
export const addProject = async (req, res, next) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required',
      });
    }

    const current = await getOrCreateProfile(req.user._id);
    const existingProjects = current.projects || [];

    const newProject = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      description: description ? description.trim() : '',
      techStack: Array.isArray(techStack)
        ? techStack.map((t) => t.trim()).filter(Boolean)
        : typeof techStack === 'string'
        ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      githubUrl: githubUrl ? githubUrl.trim() : '',
      liveUrl: liveUrl ? liveUrl.trim() : '',
      createdAt: new Date().toISOString(),
    };

    const updatedProjects = [...existingProjects, newProject];

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { projects: updatedProjects } },
      { new: true, upsert: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/student/profile/projects/:projectId
// @access  Private (Authenticated)
export const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, techStack, githubUrl, liveUrl } = req.body;

    const current = await getOrCreateProfile(req.user._id);
    const projects = current.projects || [];

    const projectIndex = projects.findIndex((p) => String(p._id) === String(projectId));
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const existing = projects[projectIndex];
    projects[projectIndex] = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      description: description !== undefined ? description.trim() : existing.description,
      techStack: Array.isArray(techStack)
        ? techStack.map((t) => t.trim()).filter(Boolean)
        : typeof techStack === 'string'
        ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
        : existing.techStack,
      githubUrl: githubUrl !== undefined ? githubUrl.trim() : existing.githubUrl,
      liveUrl: liveUrl !== undefined ? liveUrl.trim() : existing.liveUrl,
      updatedAt: new Date().toISOString(),
    };

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { projects } },
      { new: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/student/profile/projects/:projectId
// @access  Private (Authenticated)
export const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const current = await getOrCreateProfile(req.user._id);
    const projects = (current.projects || []).filter((p) => String(p._id) !== String(projectId));

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { projects } },
      { new: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Project removed successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a certification
// @route   POST /api/student/profile/certifications
// @access  Private (Authenticated)
export const addCertification = async (req, res, next) => {
  try {
    const { title, issuer, issueDate, credentialUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Certification title is required',
      });
    }

    const current = await getOrCreateProfile(req.user._id);
    const existingCerts = current.certifications || [];

    const newCert = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      issuer: issuer ? issuer.trim() : '',
      issueDate: issueDate ? issueDate.trim() : '',
      credentialUrl: credentialUrl ? credentialUrl.trim() : '',
      createdAt: new Date().toISOString(),
    };

    const updatedCerts = [...existingCerts, newCert];

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { certifications: updatedCerts } },
      { new: true, upsert: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Certification added successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a certification
// @route   PUT /api/student/profile/certifications/:certId
// @access  Private (Authenticated)
export const updateCertification = async (req, res, next) => {
  try {
    const { certId } = req.params;
    const { title, issuer, issueDate, credentialUrl } = req.body;

    const current = await getOrCreateProfile(req.user._id);
    const certifications = current.certifications || [];

    const certIndex = certifications.findIndex((c) => String(c._id) === String(certId));
    if (certIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found',
      });
    }

    const existing = certifications[certIndex];
    certifications[certIndex] = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      issuer: issuer !== undefined ? issuer.trim() : existing.issuer,
      issueDate: issueDate !== undefined ? issueDate.trim() : existing.issueDate,
      credentialUrl: credentialUrl !== undefined ? credentialUrl.trim() : existing.credentialUrl,
      updatedAt: new Date().toISOString(),
    };

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { certifications } },
      { new: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Certification updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a certification
// @route   DELETE /api/student/profile/certifications/:certId
// @access  Private (Authenticated)
export const deleteCertification = async (req, res, next) => {
  try {
    const { certId } = req.params;
    const current = await getOrCreateProfile(req.user._id);
    const certifications = (current.certifications || []).filter(
      (c) => String(c._id) !== String(certId)
    );

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { certifications } },
      { new: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Certification removed successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume details
// @route   POST /api/student/profile/resume
// @access  Private (Authenticated)
export const updateResume = async (req, res, next) => {
  try {
    const { url, fileName } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Resume link or document URL is required',
      });
    }

    const resumeData = {
      url: url.trim(),
      fileName: fileName ? fileName.trim() : 'student_resume.pdf',
      updatedAt: new Date().toISOString(),
    };

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { resume: resumeData } },
      { new: true, upsert: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/student/profile/resume
// @access  Private (Authenticated)
export const deleteResume = async (req, res, next) => {
  try {
    const resumeData = {
      url: '',
      fileName: '',
      updatedAt: null,
    };

    await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { resume: resumeData } },
      { new: true }
    );

    const updatedProfile = await getOrCreateProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Resume removed successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};
