/**
 * Eligibility Engine — pure, backend-authoritative logic
 *
 * Checks a student profile against a placement drive's requirements and
 * returns a structured result with an overall verdict and per-criterion
 * pass/fail reasons so the UI can display exact rejection reasons.
 */

/**
 * Normalise a department string for loose matching.
 * Strips punctuation, lowercases, and collapses whitespace so that
 * "Computer Science and Engineering" matches "CSE" heuristically.
 */
const normaliseDept = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Returns true when studentDept is a substring of any eligible department
 * or any eligible department word is contained in studentDept.
 * Falls back to exact normalised equality.
 */
const deptMatches = (studentDept, eligibleDepartments) => {
  if (!Array.isArray(eligibleDepartments) || eligibleDepartments.length === 0) {
    return true; // Open to all departments
  }
  const sNorm = normaliseDept(studentDept);
  return eligibleDepartments.some((dept) => {
    const dNorm = normaliseDept(dept);
    return dNorm === sNorm || dNorm.includes(sNorm) || sNorm.includes(dNorm);
  });
};

/**
 * @typedef {Object} EligibilityCriterion
 * @property {string}  field    - The field name being checked
 * @property {boolean} passed   - Whether this criterion passed
 * @property {string}  label    - Human-readable criterion label
 * @property {string}  message  - Detailed pass/fail message
 * @property {*}       actual   - The student's actual value
 * @property {*}       required - The drive's required value / threshold
 */

/**
 * @typedef {Object} EligibilityResult
 * @property {boolean}               eligible   - Overall eligibility verdict
 * @property {string}                summary    - Short one-line verdict
 * @property {EligibilityCriterion[]} criteria  - Per-criterion breakdown
 * @property {string[]}              reasons    - Failure reason strings (empty if eligible)
 * @property {boolean}               profileIncomplete - true when profile data is insufficient
 */

/**
 * Check whether a student profile meets a placement drive's requirements.
 *
 * @param {Object} profile  - Student profile document (may be null / partial)
 * @param {Object} drive    - Placement drive document
 * @returns {EligibilityResult}
 */
export const checkEligibility = (profile, drive) => {
  // Guard: no profile data at all
  if (!profile) {
    return {
      eligible: false,
      summary: 'Not Eligible: Student profile not found',
      criteria: [],
      reasons: ['Student profile not found. Please complete your profile.'],
      profileIncomplete: true,
    };
  }

  const criteria = [];
  const reasons = [];

  // ─── 1. Department ───────────────────────────────────────────────────────
  const hasDept = !!(profile.department && profile.department.trim());
  const deptEligible = hasDept && deptMatches(profile.department, drive.eligibleDepartments);
  const deptOpen =
    !Array.isArray(drive.eligibleDepartments) || drive.eligibleDepartments.length === 0;

  let deptMessage;
  if (deptOpen) {
    deptMessage = 'Open to all departments';
  } else if (!hasDept) {
    deptMessage = 'Department not set in your profile';
  } else if (!deptEligible) {
    deptMessage = `Your department "${profile.department}" is not in the eligible list: ${drive.eligibleDepartments.join(', ')}`;
  } else {
    deptMessage = `Your department "${profile.department}" qualifies`;
  }

  const deptPassed = deptOpen || deptEligible;
  criteria.push({
    field: 'department',
    passed: deptPassed,
    label: 'Department',
    message: deptMessage,
    actual: profile.department || '(not set)',
    required: deptOpen ? 'All departments' : drive.eligibleDepartments,
  });
  if (!deptPassed) reasons.push(deptMessage);

  // ─── 2. CGPA ─────────────────────────────────────────────────────────────
  const minCGPA = drive.minimumCGPA ?? 0;
  const studentCGPA = profile.cgpa;
  const hasCGPA = studentCGPA !== null && studentCGPA !== undefined;
  const cgpaPassed = hasCGPA && studentCGPA >= minCGPA;

  let cgpaMessage;
  if (!hasCGPA) {
    cgpaMessage = `CGPA not set in your profile (required: ${minCGPA}+)`;
  } else if (!cgpaPassed) {
    cgpaMessage = `CGPA ${studentCGPA.toFixed(2)} is below required CGPA ${minCGPA}`;
  } else {
    cgpaMessage = `CGPA ${studentCGPA.toFixed(2)} meets the minimum requirement of ${minCGPA}`;
  }

  criteria.push({
    field: 'cgpa',
    passed: cgpaPassed,
    label: 'CGPA',
    message: cgpaMessage,
    actual: hasCGPA ? studentCGPA : '(not set)',
    required: minCGPA,
  });
  if (!cgpaPassed) reasons.push(cgpaMessage);

  // ─── 3. Backlogs ─────────────────────────────────────────────────────────
  const maxBacklogs = drive.maximumBacklogs ?? 0;
  const studentBacklogs = profile.backlogs ?? 0;
  const backlogsPassed = studentBacklogs <= maxBacklogs;

  let backlogsMessage;
  if (!backlogsPassed) {
    backlogsMessage = `You have ${studentBacklogs} active backlog${studentBacklogs !== 1 ? 's' : ''}, exceeding the maximum allowed (${maxBacklogs})`;
  } else {
    backlogsMessage = `Backlogs (${studentBacklogs}) within the allowed limit of ${maxBacklogs}`;
  }

  criteria.push({
    field: 'backlogs',
    passed: backlogsPassed,
    label: 'Active Backlogs',
    message: backlogsMessage,
    actual: studentBacklogs,
    required: maxBacklogs,
  });
  if (!backlogsPassed) reasons.push(backlogsMessage);

  // ─── 4. Graduation Year ───────────────────────────────────────────────────
  const requiredYear = drive.graduationYear;
  // Extract year from batch string like "2021-2025" → 2025
  let studentGradYear = null;
  if (profile.batch && profile.batch.trim()) {
    const parts = profile.batch.trim().split('-');
    const candidate = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(candidate) && candidate > 2000) studentGradYear = candidate;
  }

  const hasGradYear = studentGradYear !== null;
  const gradYearPassed = hasGradYear && studentGradYear === requiredYear;

  let gradYearMessage;
  if (!hasGradYear) {
    gradYearMessage = `Graduation year could not be determined from your batch (required: ${requiredYear})`;
  } else if (!gradYearPassed) {
    gradYearMessage = `Your graduation year ${studentGradYear} does not match the required year ${requiredYear}`;
  } else {
    gradYearMessage = `Graduation year ${studentGradYear} matches the drive requirement`;
  }

  criteria.push({
    field: 'graduationYear',
    passed: gradYearPassed,
    label: 'Graduation Year',
    message: gradYearMessage,
    actual: studentGradYear ?? '(not determined)',
    required: requiredYear,
  });
  if (!gradYearPassed) reasons.push(gradYearMessage);

  // ─── 5. Profile completeness check ────────────────────────────────────────
  const profileIncomplete = !hasDept || !hasCGPA || !hasGradYear;

  // ─── Overall verdict ──────────────────────────────────────────────────────
  const eligible = criteria.every((c) => c.passed);

  let summary;
  if (eligible) {
    summary = 'Eligible: You meet all requirements for this drive';
  } else {
    summary = `Not Eligible: ${reasons[0]}`;
  }

  return {
    eligible,
    summary,
    criteria,
    reasons,
    profileIncomplete,
  };
};
