import api from './axios';

/**
 * Apply to a placement drive (Student only)
 * @param {Object} data - { placementDrive: string, remarks?: string }
 */
export const applyToPlacementDrive = async (data) => {
  const response = await api.post('/applications/apply', data);
  return response.data;
};

/**
 * Get applications submitted by currently logged-in student
 * @param {Object} params - { status?: string }
 */
export const getMyApplications = async (params = {}) => {
  const response = await api.get('/applications/my', { params });
  return response.data;
};

/**
 * Get all applications / applicants (Officer & Admin)
 * @param {Object} params - { driveId?: string, status?: string, search?: string }
 */
export const getAllApplications = async (params = {}) => {
  const response = await api.get('/applications', { params });
  return response.data;
};

/**
 * Get single application by ID
 * @param {string} id - Application ID
 */
export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

/**
 * Update application status and/or remarks (Officer & Admin)
 * @param {string} id - Application ID
 * @param {Object} data - { status?: string, remarks?: string }
 */
export const updateApplicationStatus = async (id, data) => {
  const response = await api.patch(`/applications/${id}/status`, data);
  return response.data;
};

/**
 * Quick Shortlist an applicant (Officer & Admin)
 * @param {string} id - Application ID
 * @param {string} remarks - Optional remarks
 */
export const shortlistApplication = async (id, remarks = '') => {
  const response = await api.patch(`/applications/${id}/shortlist`, { remarks });
  return response.data;
};

/**
 * Quick Reject an applicant (Officer & Admin)
 * @param {string} id - Application ID
 * @param {string} remarks - Optional remarks
 */
export const rejectApplication = async (id, remarks = '') => {
  const response = await api.patch(`/applications/${id}/reject`, { remarks });
  return response.data;
};

/**
 * Get summary stats of applications
 */
export const getApplicationStats = async () => {
  const response = await api.get('/applications/stats');
  return response.data;
};
