import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { localUserStore } from './userStore.js';
import { localStudentProfileStore } from './studentProfileStore.js';
import { localPlacementDriveStore } from './placementDriveStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'applications.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const readApplications = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeApplications = (apps) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2));
};

const attachRelations = async (app) => {
  if (!app) return null;

  let studentObj = null;
  const studentId = app.student?._id || app.student;
  if (studentId) {
    const user = await localUserStore.findById(studentId);
    const profile = await localStudentProfileStore.findOne({ user: studentId });
    if (user) {
      studentObj = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profile
          ? {
              department: profile.department || '',
              batch: profile.batch || '',
              cgpa: profile.cgpa ?? null,
              backlogs: profile.backlogs ?? 0,
              phone: profile.phone || '',
              skills: profile.skills || [],
              resume: profile.resume || { url: '', fileName: '' },
            }
          : null,
      };
    }
  }

  let driveObj = null;
  const driveId = app.placementDrive?._id || app.placementDrive;
  if (driveId) {
    const drive = await localPlacementDriveStore.findById(driveId);
    if (drive) {
      driveObj = {
        _id: drive._id,
        jobRole: drive.jobRole,
        jobDescription: drive.jobDescription,
        salaryPackage: drive.salaryPackage,
        eligibleDepartments: drive.eligibleDepartments,
        minimumCGPA: drive.minimumCGPA,
        maximumBacklogs: drive.maximumBacklogs,
        graduationYear: drive.graduationYear,
        driveDate: drive.driveDate,
        applicationDeadline: drive.applicationDeadline,
        status: drive.status,
        company: drive.company,
      };
    }
  }

  return {
    ...app,
    student: studentObj || app.student,
    placementDrive: driveObj || app.placementDrive,
  };
};

export const localApplicationStore = {
  find(query = {}) {
    const chainable = {
      _sortKey: 'appliedAt',
      _sortOrder: -1,
      _populateFields: [],
      sort(sortOptions) {
        if (typeof sortOptions === 'object') {
          const keys = Object.keys(sortOptions);
          if (keys.length > 0) {
            this._sortKey = keys[0];
            this._sortOrder = sortOptions[keys[0]] === 1 || sortOptions[keys[0]] === 'asc' ? 1 : -1;
          }
        }
        return this;
      },
      populate(fields) {
        this._populateFields.push(fields);
        return this;
      },
      async then(resolve, reject) {
        try {
          let apps = readApplications();

          // Query filtering
          if (query && typeof query === 'object') {
            if (query._id) {
              apps = apps.filter((a) => String(a._id) === String(query._id));
            }
            if (query.student) {
              const qStudent = query.student.toString ? query.student.toString() : String(query.student);
              apps = apps.filter((a) => {
                const sId = a.student?._id ? String(a.student._id) : String(a.student);
                return sId === qStudent;
              });
            }
            if (query.placementDrive) {
              const qDrive = query.placementDrive.toString ? query.placementDrive.toString() : String(query.placementDrive);
              apps = apps.filter((a) => {
                const dId = a.placementDrive?._id ? String(a.placementDrive._id) : String(a.placementDrive);
                return dId === qDrive;
              });
            }
            if (query.status && query.status !== 'ALL') {
              apps = apps.filter(
                (a) => a.status && a.status.toUpperCase() === query.status.toUpperCase()
              );
            }
          }

          // Sort
          const key = this._sortKey;
          const order = this._sortOrder;
          apps.sort((a, b) => {
            const valA = a[key] ?? '';
            const valB = b[key] ?? '';
            if (valA < valB) return -1 * order;
            if (valA > valB) return 1 * order;
            return 0;
          });

          // Always populate details
          const populated = await Promise.all(apps.map(attachRelations));
          resolve(populated);
        } catch (err) {
          reject(err);
        }
      },
    };

    return chainable;
  },

  findById(id) {
    const chainable = {
      _populateFields: [],
      populate(fields) {
        this._populateFields.push(fields);
        return this;
      },
      async then(resolve, reject) {
        try {
          const apps = readApplications();
          const app = apps.find((a) => String(a._id) === String(id));
          if (!app) return resolve(null);
          const populated = await attachRelations(app);
          resolve(populated);
        } catch (err) {
          reject(err);
        }
      },
    };
    return chainable;
  },

  async findOne(query) {
    const list = await this.find(query);
    return list[0] || null;
  },

  async create(data) {
    const apps = readApplications();

    const studentId = String(data.student?._id || data.student);
    const driveId = String(data.placementDrive?._id || data.placementDrive);

    // Duplicate check
    const existing = apps.find((a) => {
      const aStudent = String(a.student?._id || a.student);
      const aDrive = String(a.placementDrive?._id || a.placementDrive);
      return aStudent === studentId && aDrive === driveId;
    });

    if (existing) {
      const error = new Error('You have already applied for this placement drive');
      error.code = 11000;
      throw error;
    }

    const now = new Date().toISOString();
    const newApp = {
      _id: data._id || crypto.randomBytes(12).toString('hex'),
      student: studentId,
      placementDrive: driveId,
      appliedAt: data.appliedAt ? new Date(data.appliedAt).toISOString() : now,
      status: (data.status || 'APPLIED').toUpperCase(),
      remarks: (data.remarks || '').trim(),
      createdAt: now,
      updatedAt: now,
    };

    apps.unshift(newApp);
    writeApplications(apps);
    return await attachRelations(newApp);
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    const apps = readApplications();
    const index = apps.findIndex((a) => String(a._id) === String(id));
    if (index === -1) return null;

    const existing = apps[index];
    const incoming = updateData.$set ? { ...updateData.$set } : { ...updateData };
    delete incoming._id;
    delete incoming.createdAt;
    delete incoming.student;
    delete incoming.placementDrive;

    const updated = {
      ...existing,
      ...incoming,
      status: incoming.status ? incoming.status.toUpperCase() : existing.status,
      remarks: incoming.remarks !== undefined ? incoming.remarks.trim() : existing.remarks,
      updatedAt: new Date().toISOString(),
    };

    apps[index] = updated;
    writeApplications(apps);
    return await attachRelations(updated);
  },

  async findByIdAndDelete(id) {
    const apps = readApplications();
    const index = apps.findIndex((a) => String(a._id) === String(id));
    if (index === -1) return null;

    const [deleted] = apps.splice(index, 1);
    writeApplications(apps);
    return deleted;
  },

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  },
};
