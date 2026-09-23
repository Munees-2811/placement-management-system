import api from './axios';

export const getStudentProfile = async () => {
  const response = await api.get('/student/profile');
  return response.data;
};

export const updateBasicProfile = async (profileData) => {
  const response = await api.put('/student/profile', profileData);
  return response.data;
};

export const updateSkills = async (skills) => {
  const response = await api.put('/student/profile/skills', { skills });
  return response.data;
};

export const addProject = async (projectData) => {
  const response = await api.post('/student/profile/projects', projectData);
  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.put(`/student/profile/projects/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/student/profile/projects/${projectId}`);
  return response.data;
};

export const addCertification = async (certData) => {
  const response = await api.post('/student/profile/certifications', certData);
  return response.data;
};

export const updateCertification = async (certId, certData) => {
  const response = await api.put(`/student/profile/certifications/${certId}`, certData);
  return response.data;
};

export const deleteCertification = async (certId) => {
  const response = await api.delete(`/student/profile/certifications/${certId}`);
  return response.data;
};

export const updateResume = async (resumeData) => {
  const response = await api.post('/student/profile/resume', resumeData);
  return response.data;
};

export const deleteResume = async () => {
  const response = await api.delete('/student/profile/resume');
  return response.data;
};
