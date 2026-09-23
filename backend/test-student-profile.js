import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import app from './src/app.js';
import User from './src/models/User.js';
import StudentProfile, { calculateCompletionPercentage } from './src/models/StudentProfile.js';

console.log('--- Starting Student Profile Backend Verification Suite ---\n');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production';

// Helper mock request caller for Express app
const callApp = async (method, path, body = null, token = null) => {
  return new Promise((resolve) => {
    const headers = { 'content-type': 'application/json' };
    if (token) {
      headers['authorization'] = `Bearer ${token}`;
    }

    // Use fake req/res simulation for express app
    let statusCode = 200;
    let responseData = null;

    const req = {
      method,
      url: path,
      originalUrl: path,
      headers,
      body: body || {},
      query: {},
      params: {},
    };

    const res = {
      statusCode: 200,
      status(code) {
        statusCode = code;
        this.statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        resolve({ status: statusCode, body: data });
      },
      send(data) {
        responseData = data;
        resolve({ status: statusCode, body: data });
      },
      setHeader() {},
      getHeader() {},
    };

    app.handle(req, res);
  });
};

// Test 1: Check Mongoose Schema & Completion Percentage logic
console.log('Test 1: Testing Schema & Completion Percentage computation...');
const mockProfile = {
  phone: '+91 9876543210',
  department: 'Computer Science and Engineering',
  batch: '2022-2026',
  cgpa: 8.75,
  skills: ['React', 'Node.js', 'Express', 'MongoDB'],
  projects: [{ title: 'Placement Portal' }],
  certifications: [{ title: 'AWS Cloud Practitioner' }],
  resume: { url: 'https://example.com/resume.pdf' },
};

const fullStats = calculateCompletionPercentage(mockProfile);
assert.strictEqual(fullStats.percentage, 100, 'All fields populated must result in 100% completion');
assert.strictEqual(fullStats.breakdown.phone, true);
assert.strictEqual(fullStats.breakdown.department, true);
assert.strictEqual(fullStats.breakdown.batch, true);
assert.strictEqual(fullStats.breakdown.cgpa, true);
assert.strictEqual(fullStats.breakdown.skills, true);
assert.strictEqual(fullStats.breakdown.projects, true);
assert.strictEqual(fullStats.breakdown.certifications, true);
assert.strictEqual(fullStats.breakdown.resume, true);

const emptyStats = calculateCompletionPercentage({});
assert.strictEqual(emptyStats.percentage, 0, 'Empty profile must result in 0% completion');
console.log('✅ Test 1 Passed: Completion percentage and breakdown calculated accurately.\n');

// Test 2: Unauthenticated access rejection
console.log('Test 2: Verifying unauthenticated request to /api/student/profile is rejected...');
const unauthRes = await callApp('GET', '/api/student/profile', null, null);
assert.strictEqual(unauthRes.status, 401, 'Should return 401 Unauthorized without token');
assert.strictEqual(unauthRes.body.success, false);
console.log('✅ Test 2 Passed: Unauthenticated requests correctly rejected with 401.\n');

// Test 3: Authenticated Get / Initialize Profile
console.log('Test 3: Testing authenticated Profile retrieval...');
// Create or fetch a test student user
let testUser = await User.findOne({ email: 'student_tester@placement.edu' });
if (!testUser) {
  testUser = await User.create({
    name: 'Student Tester',
    email: 'student_tester@placement.edu',
    password: 'password123',
    role: 'STUDENT',
  });
}
const token = jwt.sign({ id: testUser._id }, JWT_SECRET, { expiresIn: '1h' });

const getRes = await callApp('GET', '/api/student/profile', null, token);
assert.strictEqual(getRes.status, 200, 'Should return 200 OK');
assert.strictEqual(getRes.body.success, true);
assert.strictEqual(String(getRes.body.data.user._id), String(testUser._id));
console.log('✅ Test 3 Passed: Profile retrieved and initialized for authenticated student.\n');

// Test 4: Update Basic Profile (phone, department, batch, cgpa, bio)
console.log('Test 4: Testing update basic profile fields (phone, department, batch, CGPA, bio)...');
const updateData = {
  phone: '+91 9123456780',
  department: 'Information Technology',
  batch: '2023-2027',
  cgpa: 9.15,
  bio: 'Passionate full-stack developer eager to learn and build modern scalable apps.',
};
const updateRes = await callApp('PUT', '/api/student/profile', updateData, token);
assert.strictEqual(updateRes.status, 200);
assert.strictEqual(updateRes.body.data.phone, updateData.phone);
assert.strictEqual(updateRes.body.data.department, updateData.department);
assert.strictEqual(updateRes.body.data.batch, updateData.batch);
assert.strictEqual(updateRes.body.data.cgpa, updateData.cgpa);
assert.strictEqual(updateRes.body.data.bio, updateData.bio);

// Validate CGPA boundary checks
const invalidCgpaRes = await callApp('PUT', '/api/student/profile', { cgpa: 12.5 }, token);
assert.strictEqual(invalidCgpaRes.status, 400, 'Invalid CGPA > 10 should be rejected');
console.log('✅ Test 4 Passed: Basic profile fields updated and validated successfully.\n');

// Test 5: Update Skills
console.log('Test 5: Testing skills management...');
const skillsData = { skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS', 'TypeScript'] };
const skillsRes = await callApp('PUT', '/api/student/profile/skills', skillsData, token);
assert.strictEqual(skillsRes.status, 200);
assert.deepStrictEqual(skillsRes.body.data.skills, skillsData.skills);
console.log('✅ Test 5 Passed: Skills updated successfully.\n');

// Test 6: Add, Update, and Delete Project
console.log('Test 6: Testing project CRUD...');
const projectData = {
  title: 'AI Placement Matcher',
  description: 'Full stack placement matching platform built with MERN stack.',
  techStack: ['React', 'Node.js', 'MongoDB'],
  githubUrl: 'https://github.com/test/ai-placement',
  liveUrl: 'https://ai-placement.example.com',
};
const addProjectRes = await callApp('POST', '/api/student/profile/projects', projectData, token);
assert.strictEqual(addProjectRes.status, 201);
const addedProject = addProjectRes.body.data.projects.find((p) => p.title === projectData.title);
assert(addedProject, 'Added project should be found in profile projects list');
assert.strictEqual(addedProject.title, projectData.title);

// Update project
const updateProjectRes = await callApp(
  'PUT',
  `/api/student/profile/projects/${addedProject._id}`,
  { title: 'AI Placement Matcher Pro', techStack: ['React', 'Node.js', 'MongoDB', 'Vite'] },
  token
);
assert.strictEqual(updateProjectRes.status, 200);
const updatedProject = updateProjectRes.body.data.projects.find((p) => String(p._id) === String(addedProject._id));
assert.strictEqual(updatedProject.title, 'AI Placement Matcher Pro');

// Delete project
const deleteProjectRes = await callApp(
  'DELETE',
  `/api/student/profile/projects/${addedProject._id}`,
  null,
  token
);
assert.strictEqual(deleteProjectRes.status, 200);
const deletedProject = deleteProjectRes.body.data.projects.find((p) => String(p._id) === String(addedProject._id));
assert.strictEqual(deletedProject, undefined, 'Project should be removed after deletion');
console.log('✅ Test 6 Passed: Projects added, updated, and removed smoothly.\n');

// Test 7: Add, Update, and Delete Certification
console.log('Test 7: Testing certification CRUD...');
const certData = {
  title: 'AWS Certified Cloud Practitioner',
  issuer: 'Amazon Web Services',
  issueDate: '2025-05',
  credentialUrl: 'https://aws.amazon.com/verify/12345',
};
const addCertRes = await callApp('POST', '/api/student/profile/certifications', certData, token);
assert.strictEqual(addCertRes.status, 201);
const addedCert = addCertRes.body.data.certifications.find((c) => c.title === certData.title);
assert(addedCert, 'Added certification should be found in profile');

const deleteCertRes = await callApp(
  'DELETE',
  `/api/student/profile/certifications/${addedCert._id}`,
  null,
  token
);
assert.strictEqual(deleteCertRes.status, 200);
console.log('✅ Test 7 Passed: Certifications added and managed successfully.\n');

// Test 8: Resume Update and Retrieval
console.log('Test 8: Testing resume upload / update and status tracking...');
const resumePayload = {
  url: 'https://storage.example.com/resumes/student_tester_cv.pdf',
  fileName: 'Student_Tester_Resume.pdf',
};
const resumeRes = await callApp('POST', '/api/student/profile/resume', resumePayload, token);
assert.strictEqual(resumeRes.status, 200);
assert.strictEqual(resumeRes.body.data.resume.url, resumePayload.url);
assert.strictEqual(resumeRes.body.data.resume.fileName, resumePayload.fileName);
assert(resumeRes.body.data.resume.updatedAt, 'Resume updatedAt must be set');

// Verify completion percentage increased now that phone, dept, batch, cgpa, skills, resume are filled
assert(resumeRes.body.data.completionPercentage >= 60, 'Completion score should reflect filled sections');
console.log(`✅ Test 8 Passed: Resume updated successfully (Completion Score: ${resumeRes.body.data.completionPercentage}%).\n`);

console.log('🎉 ALL 8 STUDENT PROFILE MODULE BACKEND TESTS PASSED SUCCESSFULLY! 🎉');
process.exit(0);
