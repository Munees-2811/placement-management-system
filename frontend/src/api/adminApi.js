import api from './axios';

/**
 * Admin: Create a new student account
 * POST /api/admin/students
 */
export const adminCreateStudent = (data) => api.post('/admin/students', data);

/**
 * Admin: List all student accounts
 * GET /api/admin/students
 */
export const adminListStudents = () => api.get('/admin/students');

