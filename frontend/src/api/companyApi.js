import api from './axios';

/**
 * Fetch all companies with optional search, industry filter, and sort
 */
export const getCompanies = async (params = {}) => {
  const response = await api.get('/companies', { params });
  return response.data;
};

/**
 * Fetch a single company by ID
 */
export const getCompanyById = async (id) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

/**
 * Create a new company (restricted to ADMIN, PLACEMENT_OFFICER)
 */
export const createCompany = async (companyData) => {
  const response = await api.post('/companies', companyData);
  return response.data;
};

/**
 * Update company by ID (restricted to ADMIN, PLACEMENT_OFFICER)
 */
export const updateCompany = async (id, companyData) => {
  const response = await api.put(`/companies/${id}`, companyData);
  return response.data;
};

/**
 * Delete company by ID (restricted to ADMIN, PLACEMENT_OFFICER)
 */
export const deleteCompany = async (id) => {
  const response = await api.delete(`/companies/${id}`);
  return response.data;
};
