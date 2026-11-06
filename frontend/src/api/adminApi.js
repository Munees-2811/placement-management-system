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

/**
 * Admin: Bulk import multiple student accounts
 * POST /api/admin/students/bulk-import
 */
export const adminBulkImportStudents = (data) =>
  api.post('/admin/students/bulk-import', data);

/**
 * Admin: Resend credentials with newly generated temporary password and email dispatch
 * POST /api/admin/students/:id/resend-credentials
 */
export const adminResendCredentials = (studentId) =>
  api.post(`/admin/students/${studentId}/resend-credentials`);



