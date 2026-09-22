import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';
import { protect, authorizeRoles } from './src/middlewares/authMiddleware.js';

console.log('--- Starting Authentication & Role Authorization Test Suite ---\n');

// Test 1: User Schema checks
console.log('Test 1: Checking User model schema & role enum definition...');
const rolePath = User.schema.path('role');
assert.strictEqual(rolePath.defaultValue, 'STUDENT', 'Default role should be STUDENT');
assert.deepStrictEqual(
  rolePath.enumValues,
  ['STUDENT', 'PLACEMENT_OFFICER', 'ADMIN'],
  'Roles should strictly be STUDENT, PLACEMENT_OFFICER, ADMIN'
);
console.log('✅ Test 1 Passed: User model schema configured with STUDENT, PLACEMENT_OFFICER, ADMIN roles.\n');

// Test 2: Bcrypt password hashing & comparison
console.log('Test 2: Testing bcrypt hashing & verification...');
const rawPassword = 'SecureStudentPassword!123';
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(rawPassword, salt);

assert.notStrictEqual(hashedPassword, rawPassword, 'Hashed password must not equal plain text');
assert.strictEqual(hashedPassword.startsWith('$2'), true, 'Password hash should be valid bcrypt hash');

const correctMatch = await bcrypt.compare(rawPassword, hashedPassword);
assert.strictEqual(correctMatch, true, 'Bcrypt compare must return true for matching password');

const incorrectMatch = await bcrypt.compare('WrongPassword456', hashedPassword);
assert.strictEqual(incorrectMatch, false, 'Bcrypt compare must return false for wrong password');
console.log('✅ Test 2 Passed: Bcrypt hashing & verification works accurately.\n');

// Test 3: JWT signing and verification
console.log('Test 3: Testing JWT generation & verification...');
const secretKey = 'test_secret_key_12345';
const sampleUserId = '64f1234567890abcdef12345';
const token = jwt.sign({ id: sampleUserId }, secretKey, { expiresIn: '1h' });

const decoded = jwt.verify(token, secretKey);
assert.strictEqual(decoded.id, sampleUserId, 'Decoded JWT id must match signed payload');

assert.throws(
  () => {
    jwt.verify(token, 'wrong_secret_key');
  },
  /invalid signature/,
  'JWT verification must throw on invalid secret key'
);
console.log('✅ Test 3 Passed: JWT signing and validation verified.\n');

// Test 4: Auth middleware (protect)
console.log('Test 4: Testing protect middleware when token is missing...');
let statusCode = 0;
let jsonBody = null;

const fakeReqNoToken = { headers: {} };
const fakeRes = {
  status(code) {
    statusCode = code;
    return this;
  },
  json(body) {
    jsonBody = body;
    return this;
  },
};

let nextCalled = false;
await protect(fakeReqNoToken, fakeRes, () => {
  nextCalled = true;
});

assert.strictEqual(nextCalled, false, 'next() should not be called when token is missing');
assert.strictEqual(statusCode, 401, 'Should return 401 Unauthorized for missing token');
assert.strictEqual(jsonBody.success, false);
console.log('✅ Test 4 Passed: Missing token is correctly rejected with 401.\n');

// Test 5: Role-based authorization middleware (authorizeRoles)
console.log('Test 5: Testing authorizeRoles role enforcement...');

// 5a. Student accessing student resource -> allowed
const studentReq = { user: { role: 'STUDENT', name: 'John Doe' } };
nextCalled = false;
statusCode = 0;
const studentAuth = authorizeRoles('STUDENT');
studentAuth(studentReq, fakeRes, () => {
  nextCalled = true;
});
assert.strictEqual(nextCalled, true, 'Student should be allowed on STUDENT route');

// 5b. Student accessing officer resource -> forbidden (403)
nextCalled = false;
statusCode = 0;
jsonBody = null;
const officerAuth = authorizeRoles('PLACEMENT_OFFICER', 'ADMIN');
officerAuth(studentReq, fakeRes, () => {
  nextCalled = true;
});
assert.strictEqual(nextCalled, false, 'Student should NOT be allowed on PLACEMENT_OFFICER route');
assert.strictEqual(statusCode, 403, 'Should return 403 Forbidden');
assert.strictEqual(jsonBody.success, false);
assert.strictEqual(jsonBody.message.includes('STUDENT'), true, 'Error message should mention role');

// 5c. Placement Officer accessing officer resource -> allowed
const officerReq = { user: { role: 'PLACEMENT_OFFICER', name: 'Dr. Officer' } };
nextCalled = false;
officerAuth(officerReq, fakeRes, () => {
  nextCalled = true;
});
assert.strictEqual(nextCalled, true, 'Placement Officer should be allowed on officer route');

// 5d. Placement Officer accessing admin resource -> forbidden (403)
nextCalled = false;
statusCode = 0;
jsonBody = null;
const adminAuth = authorizeRoles('ADMIN');
adminAuth(officerReq, fakeRes, () => {
  nextCalled = true;
});
assert.strictEqual(nextCalled, false, 'Officer should NOT be allowed on ADMIN route');
assert.strictEqual(statusCode, 403, 'Should return 403 Forbidden');

// 5e. Admin accessing admin resource -> allowed
const adminReq = { user: { role: 'ADMIN', name: 'System Admin' } };
nextCalled = false;
adminAuth(adminReq, fakeRes, () => {
  nextCalled = true;
});
assert.strictEqual(nextCalled, true, 'Admin should be allowed on ADMIN route');

console.log('✅ Test 5 Passed: Role-based authorization correctly protects STUDENT, PLACEMENT_OFFICER, and ADMIN endpoints!\n');

console.log('🎉 ALL 5 AUTHENTICATION & ROLE AUTHORIZATION TESTS PASSED SUCCESSFULLY! 🎉');
