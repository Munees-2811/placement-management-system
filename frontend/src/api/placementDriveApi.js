import api from './axios';

/**
 * Fetch all placement drives with optional search, status, and department filters
 */
export const getDrives = async (params = {}) => {
  const response = await api.get('/drives', { params });
  return response.data;
};

/**
 * Fetch a single placement drive by ID
 */
export const getDriveById = async (id) => {
  const response = await api.get(`/drives/${id}`);
  return response.data;
};

/**
 * Create a new placement drive (Restricted to PLACEMENT_OFFICER, ADMIN)
 */
export const createDrive = async (driveData) => {
  const response = await api.post('/drives', driveData);
  return response.data;
};

/**
 * Update an existing placement drive (Restricted to PLACEMENT_OFFICER, ADMIN)
 */
export const updateDrive = async (id, driveData) => {
  const response = await api.put(`/drives/${id}`, driveData);
  return response.data;
};

/**
 * Delete a placement drive (Restricted to PLACEMENT_OFFICER, ADMIN)
 */
export const deleteDrive = async (id) => {
  const response = await api.delete(`/drives/${id}`);
  return response.data;
};

/**
 * Bulk eligibility check — returns a map of { driveId: EligibilityResult }
 * for the currently logged-in student.
 * Officers/Admins receive an empty map from the server.
 */
export const getMyEligibility = async () => {
  const response = await api.get('/drives/my-eligibility');
  return response.data;
};

/**
 * Per-drive eligibility check for the logged-in student.
 * Returns a full EligibilityResult with criteria breakdown.
 */
export const checkDriveEligibility = async (driveId) => {
  const response = await api.get(`/drives/${driveId}/eligibility`);
  return response.data;
};
