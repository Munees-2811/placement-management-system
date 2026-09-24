import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import app from './src/app.js';
import { validatePlacementDriveInput } from './src/middlewares/placementDriveValidation.js';

console.log('--- Starting Placement Drive Module Verification Suite ---\n');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production';

// Helper mock request caller for Express app
const callApp = async (method, path, body = null, token = null) => {
  return new Promise((resolve) => {
    const headers = { 'content-type': 'application/json' };
    if (token) {
      headers['authorization'] = `Bearer ${token}`;
    }

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

// Users matching backend/data/users.json
const studentUser = {
  id: '6ab2ad6b0c830a4e4924efed',
  email: 'munees7539@gmail.com',
  role: 'STUDENT',
};

const officerUser = {
  id: '6ab3e9f66ece8a0db15b576a',
  email: 'anbu24@gmail.com',
  role: 'PLACEMENT_OFFICER',
};

const adminUser = {
  id: '6ab2ade56ecf36b6732cdaa2',
  email: 'senthil34@gmail.com',
  role: 'ADMIN',
};

const studentToken = jwt.sign(studentUser, JWT_SECRET, { expiresIn: '1d' });
const officerToken = jwt.sign(officerUser, JWT_SECRET, { expiresIn: '1d' });
const adminToken = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '1d' });

async function runTests() {
  try {
    // ----------------------------------------------------
    // Test 1: Validation Unit Tests
    // ----------------------------------------------------
    console.log('Test 1: Testing Placement Drive Input Validation...');
    const invalidData = {
      company: '',
      jobRole: '',
      jobDescription: '',
      salaryPackage: '',
      eligibleDepartments: [],
      minimumCGPA: 12, // exceeds 10
      maximumBacklogs: -1,
      graduationYear: 2010, // too early
      applicationDeadline: 'invalid-date',
      driveDate: 'invalid-date',
    };
    const valResult = validatePlacementDriveInput(invalidData, false);
    assert.strictEqual(valResult.isValid, false, 'Validation should fail on empty/invalid inputs');
    assert.ok(valResult.errors.some((e) => e.field === 'company'), 'Should flag missing company');
    assert.ok(valResult.errors.some((e) => e.field === 'jobRole'), 'Should flag missing jobRole');
    assert.ok(valResult.errors.some((e) => e.field === 'minimumCGPA'), 'Should flag invalid CGPA');
    assert.ok(valResult.errors.some((e) => e.field === 'maximumBacklogs'), 'Should flag negative backlogs');
    assert.ok(valResult.errors.some((e) => e.field === 'graduationYear'), 'Should flag invalid graduation year');

    const validData = {
      company: '7bc1001a1c920b5e4835a001',
      jobRole: 'Full Stack Engineer',
      jobDescription: 'Build scalable web platforms.',
      salaryPackage: '15 LPA',
      eligibleDepartments: ['Computer Science and Engineering', 'Information Technology'],
      minimumCGPA: 7.5,
      maximumBacklogs: 0,
      graduationYear: 2026,
      applicationDeadline: '2026-11-01T23:59:59.000Z',
      driveDate: '2026-11-10T09:00:00.000Z',
      status: 'UPCOMING',
    };
    const validResult = validatePlacementDriveInput(validData, false);
    assert.strictEqual(validResult.isValid, true, 'Valid placement drive input should pass validation');
    console.log('✅ Test 1 Passed: Drive input validation accurately validates schema constraints.\n');

    // ----------------------------------------------------
    // Test 2: Unauthenticated requests rejected
    // ----------------------------------------------------
    console.log('Test 2: Verifying unauthenticated request to /api/drives is rejected...');
    const unauthRes = await callApp('GET', '/api/drives', null, null);
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated request must be rejected with 401');
    console.log('✅ Test 2 Passed: Unauthenticated request returned 401 Unauthorized.\n');

    // ----------------------------------------------------
    // Test 3: Students can GET available drives
    // ----------------------------------------------------
    console.log('Test 3: Student role viewing available placement drives (GET /api/drives)...');
    const studentListRes = await callApp('GET', '/api/drives', null, studentToken);
    assert.strictEqual(studentListRes.status, 200, 'Student should be allowed to view drives');
    assert.ok(studentListRes.body.success, 'Response should indicate success');
    assert.ok(Array.isArray(studentListRes.body.data), 'Data should be an array of placement drives');
    assert.ok(studentListRes.body.data.length > 0, 'Drives list should not be empty');
    const firstDrive = studentListRes.body.data[0];
    assert.ok(firstDrive.company, 'Company info should be populated');
    assert.ok(firstDrive.company.companyName, 'Populated company should have companyName');
    console.log(`✅ Test 3 Passed: Student retrieved ${studentListRes.body.count} drives with populated company details.\n`);

    // ----------------------------------------------------
    // Test 4: Students can GET single drive by ID
    // ----------------------------------------------------
    console.log(`Test 4: Student inspecting single placement drive (${firstDrive._id})...`);
    const studentDetailRes = await callApp('GET', `/api/drives/${firstDrive._id}`, null, studentToken);
    assert.strictEqual(studentDetailRes.status, 200, 'Student should be allowed to view drive details');
    assert.strictEqual(studentDetailRes.body.data._id, firstDrive._id);
    assert.ok(studentDetailRes.body.data.minimumCGPA !== undefined, 'Drive should contain minimumCGPA criteria');
    assert.ok(Array.isArray(studentDetailRes.body.data.eligibleDepartments), 'Drive should contain eligible departments');
    console.log('✅ Test 4 Passed: Student can view full drive details & eligibility criteria.\n');

    // ----------------------------------------------------
    // Test 5: Student CANNOT create, update, or delete drives
    // ----------------------------------------------------
    console.log('Test 5: Enforcing that Student role CANNOT create, edit, or delete drives...');
    const studentCreateAttempt = await callApp('POST', '/api/drives', validData, studentToken);
    assert.strictEqual(studentCreateAttempt.status, 403, 'Student creating drive must be 403 Forbidden');

    const studentUpdateAttempt = await callApp('PUT', `/api/drives/${firstDrive._id}`, { jobRole: 'Hacked' }, studentToken);
    assert.strictEqual(studentUpdateAttempt.status, 403, 'Student updating drive must be 403 Forbidden');

    const studentDeleteAttempt = await callApp('DELETE', `/api/drives/${firstDrive._id}`, null, studentToken);
    assert.strictEqual(studentDeleteAttempt.status, 403, 'Student deleting drive must be 403 Forbidden');
    console.log('✅ Test 5 Passed: Student role strictly blocked from all mutating operations (403 Forbidden).\n');

    // ----------------------------------------------------
    // Test 6: Placement Officer CAN create a placement drive
    // ----------------------------------------------------
    console.log('Test 6: Placement Officer creates a new placement drive (POST /api/drives)...');
    const newDriveData = {
      company: '7bc1002b2d931c6f5946b002', // Microsoft
      jobRole: 'Software Engineer II (Campus Hire)',
      jobDescription: 'Design next-generation operating system components and distributed developer tooling.',
      salaryPackage: '25 LPA',
      eligibleDepartments: ['Computer Science and Engineering', 'Information Technology'],
      minimumCGPA: 8.5,
      maximumBacklogs: 0,
      graduationYear: 2026,
      applicationDeadline: '2026-11-20T23:59:59.000Z',
      driveDate: '2026-11-28T09:00:00.000Z',
      status: 'UPCOMING',
    };
    const officerCreateRes = await callApp('POST', '/api/drives', newDriveData, officerToken);
    assert.strictEqual(officerCreateRes.status, 201, 'Placement Officer should be allowed to create drive');
    assert.ok(officerCreateRes.body.data._id, 'Created drive should have an _id');
    assert.strictEqual(officerCreateRes.body.data.jobRole, 'Software Engineer II (Campus Hire)');
    const createdDriveId = officerCreateRes.body.data._id;
    console.log(`✅ Test 6 Passed: Placement Officer created drive successfully (ID: ${createdDriveId}).\n`);

    // ----------------------------------------------------
    // Test 7: Placement Officer CAN update drive
    // ----------------------------------------------------
    console.log(`Test 7: Placement Officer updates drive (PUT /api/drives/${createdDriveId})...`);
    const updateRes = await callApp(
      'PUT',
      `/api/drives/${createdDriveId}`,
      {
        salaryPackage: '26 LPA + Signing Bonus',
        status: 'ONGOING',
      },
      officerToken
    );
    assert.strictEqual(updateRes.status, 200, 'Placement Officer should be able to update drive');
    assert.strictEqual(updateRes.body.data.salaryPackage, '26 LPA + Signing Bonus');
    assert.strictEqual(updateRes.body.data.status, 'ONGOING');
    console.log('✅ Test 7 Passed: Placement Officer updated drive details successfully.\n');

    // ----------------------------------------------------
    // Test 8: Admin CAN delete drive
    // ----------------------------------------------------
    console.log(`Test 8: Admin deletes drive (DELETE /api/drives/${createdDriveId})...`);
    const adminDeleteRes = await callApp('DELETE', `/api/drives/${createdDriveId}`, null, adminToken);
    assert.strictEqual(adminDeleteRes.status, 200, 'Admin should be able to delete drive');

    // Verify it is gone
    const verifyRes = await callApp('GET', `/api/drives/${createdDriveId}`, null, studentToken);
    assert.strictEqual(verifyRes.status, 404, 'Deleted drive should return 404');
    console.log('✅ Test 8 Passed: Admin deleted drive successfully.\n');

    console.log('🎉 ALL 8 PLACEMENT DRIVE BACKEND TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  }
}

runTests();
