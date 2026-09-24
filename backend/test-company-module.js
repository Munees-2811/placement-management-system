import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import app from './src/app.js';
import Company from './src/models/Company.js';
import { validateCompanyInput } from './src/middlewares/companyValidation.js';

console.log('--- Starting Company Management Module Verification Suite ---\n');

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
    console.log('Test 1: Input Validation Logic...');
    const invalidInput = {
      companyName: '',
      industry: '',
      location: '',
      contactPerson: '',
      contactEmail: 'not-an-email',
      website: 'invalid-url',
    };
    const valResult = validateCompanyInput(invalidInput, false);
    assert.strictEqual(valResult.isValid, false, 'Validation should fail on empty/invalid inputs');
    assert.ok(valResult.errors.some((e) => e.field === 'companyName'), 'Should flag missing companyName');
    assert.ok(valResult.errors.some((e) => e.field === 'contactEmail'), 'Should flag invalid contactEmail');
    assert.ok(valResult.errors.some((e) => e.field === 'website'), 'Should flag invalid website');

    const validInput = {
      companyName: 'Acme Corp',
      industry: 'Technology',
      location: 'Bangalore, India',
      contactPerson: 'Jane Doe',
      contactEmail: 'jane.doe@acme.com',
      website: 'acme.com',
    };
    const validResult = validateCompanyInput(validInput, false);
    assert.strictEqual(validResult.isValid, true, 'Valid input should pass validation');
    assert.strictEqual(validResult.sanitized.website, 'https://acme.com', 'Website should be auto-prefixed with https://');
    console.log('✅ Test 1 Passed: Input validation accurately checks constraints.\n');

    // ----------------------------------------------------
    // Test 2: Unauthenticated requests
    // ----------------------------------------------------
    console.log('Test 2: Verifying unauthenticated request to /api/companies is rejected...');
    const unauthRes = await callApp('GET', '/api/companies', null, null);
    assert.strictEqual(unauthRes.status, 401, 'Should return 401 for unauthenticated request');
    console.log('✅ Test 2 Passed: Unauthenticated requests rejected with 401.\n');

    // ----------------------------------------------------
    // Test 3: Students can GET companies
    // ----------------------------------------------------
    console.log('Test 3: Student role viewing company list (GET /api/companies)...');
    const studentListRes = await callApp('GET', '/api/companies', null, studentToken);
    assert.strictEqual(studentListRes.status, 200, 'Student should be allowed to view companies');
    assert.ok(studentListRes.body.success, 'Response should indicate success');
    assert.ok(Array.isArray(studentListRes.body.data), 'Data should be an array of companies');
    assert.ok(studentListRes.body.data.length > 0, 'Companies list should not be empty');
    const existingCompanyId = studentListRes.body.data[0]._id;
    console.log(`✅ Test 3 Passed: Student successfully viewed ${studentListRes.body.count} companies.\n`);

    // ----------------------------------------------------
    // Test 4: Students can GET single company by ID
    // ----------------------------------------------------
    console.log(`Test 4: Student viewing single company by ID (${existingCompanyId})...`);
    const studentDetailRes = await callApp('GET', `/api/companies/${existingCompanyId}`, null, studentToken);
    assert.strictEqual(studentDetailRes.status, 200, 'Student should be allowed to view company details');
    assert.strictEqual(studentDetailRes.body.data._id, existingCompanyId);
    console.log('✅ Test 4 Passed: Student can inspect single company details.\n');

    // ----------------------------------------------------
    // Test 5: Student CANNOT CREATE, EDIT, or DELETE
    // ----------------------------------------------------
    console.log('Test 5: Enforcing that Student role CANNOT create, edit, or delete companies...');
    const createAttempt = await callApp('POST', '/api/companies', {
      companyName: 'Hacker Corp',
      industry: 'Cyber',
      location: 'Remote',
      contactPerson: 'Hacker',
      contactEmail: 'hacker@test.com',
    }, studentToken);
    assert.strictEqual(createAttempt.status, 403, 'Student creating company must be 403 Forbidden');

    const updateAttempt = await callApp('PUT', `/api/companies/${existingCompanyId}`, {
      companyName: 'Tampered Corp',
    }, studentToken);
    assert.strictEqual(updateAttempt.status, 403, 'Student editing company must be 403 Forbidden');

    const deleteAttempt = await callApp('DELETE', `/api/companies/${existingCompanyId}`, null, studentToken);
    assert.strictEqual(deleteAttempt.status, 403, 'Student deleting company must be 403 Forbidden');
    console.log('✅ Test 5 Passed: Student role strictly blocked from all mutating operations (403 Forbidden).\n');

    // ----------------------------------------------------
    // Test 6: PLACEMENT_OFFICER can CREATE a company
    // ----------------------------------------------------
    console.log('Test 6: Placement Officer creates a new company (POST /api/companies)...');
    const newCompanyData = {
      companyName: 'Tesla Mobility India',
      industry: 'Automotive & Clean Energy',
      location: 'Bengaluru, India',
      website: 'https://tesla.com/careers',
      description: 'Accelerating the world transition to sustainable energy with electric vehicles and solar power.',
      contactPerson: 'Vikram Sethi (Campus Hiring Lead)',
      contactEmail: 'vikram.sethi@tesla.com',
    };
    const officerCreateRes = await callApp('POST', '/api/companies', newCompanyData, officerToken);
    assert.strictEqual(officerCreateRes.status, 201, 'Placement Officer should be allowed to create company');
    assert.ok(officerCreateRes.body.data._id, 'Created company should have an _id');
    assert.strictEqual(officerCreateRes.body.data.companyName, 'Tesla Mobility India');
    const createdCompanyId = officerCreateRes.body.data._id;
    console.log(`✅ Test 6 Passed: Placement Officer created company successfully (ID: ${createdCompanyId}).\n`);

    // ----------------------------------------------------
    // Test 7: Duplicate company name rejection
    // ----------------------------------------------------
    console.log('Test 7: Rejecting duplicate company name registration...');
    const duplicateRes = await callApp('POST', '/api/companies', newCompanyData, officerToken);
    assert.strictEqual(duplicateRes.status, 400, 'Duplicate company name must be rejected with 400');
    console.log('✅ Test 7 Passed: Duplicate company registration prevented.\n');

    // ----------------------------------------------------
    // Test 8: PLACEMENT_OFFICER can UPDATE a company
    // ----------------------------------------------------
    console.log(`Test 8: Placement Officer updates company (PUT /api/companies/${createdCompanyId})...`);
    const updateData = {
      location: 'Bengaluru & Pune, India',
      description: 'Updated description for Tesla automotive and energy systems engineering division.',
    };
    const officerUpdateRes = await callApp('PUT', `/api/companies/${createdCompanyId}`, updateData, officerToken);
    assert.strictEqual(officerUpdateRes.status, 200, 'Placement Officer should be able to update company');
    assert.strictEqual(officerUpdateRes.body.data.location, 'Bengaluru & Pune, India');
    console.log('✅ Test 8 Passed: Placement Officer updated company details successfully.\n');

    // ----------------------------------------------------
    // Test 9: ADMIN can DELETE a company
    // ----------------------------------------------------
    console.log(`Test 9: Admin deletes company (DELETE /api/companies/${createdCompanyId})...`);
    const adminDeleteRes = await callApp('DELETE', `/api/companies/${createdCompanyId}`, null, adminToken);
    assert.strictEqual(adminDeleteRes.status, 200, 'Admin should be able to delete company');
    
    // Verify it is gone
    const verifyDeleted = await callApp('GET', `/api/companies/${createdCompanyId}`, null, studentToken);
    assert.strictEqual(verifyDeleted.status, 404, 'Deleted company should return 404');
    console.log('✅ Test 9 Passed: Admin deleted company successfully.\n');

    console.log('🎉 ALL 9 COMPANY MODULE BACKEND TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  }
}

runTests();
