import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { localCompanyStore } from './companyStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'placement_drives.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const readDrives = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeDrives = (drives) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(drives, null, 2));
};

const attachCompanyInfo = async (drive) => {
  if (!drive) return null;
  const companyId = drive.company?._id || drive.company;
  if (companyId) {
    const company = await localCompanyStore.findById(companyId);
    if (company) {
      return {
        ...drive,
        company: {
          _id: company._id,
          companyName: company.companyName,
          industry: company.industry,
          location: company.location,
          website: company.website,
          contactPerson: company.contactPerson,
          contactEmail: company.contactEmail,
        },
      };
    }
  }
  return drive;
};

export const localPlacementDriveStore = {
  find(query = {}) {
    const chainable = {
      _sortKey: 'createdAt',
      _sortOrder: -1,
      _populateField: null,
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
      populate(field) {
        this._populateField = field;
        return this;
      },
      async then(resolve, reject) {
        try {
          let drives = readDrives();

          // Filtering
          if (query && typeof query === 'object') {
            if (query._id) {
              drives = drives.filter((d) => String(d._id) === String(query._id));
            }
            if (query.status && typeof query.status === 'string' && query.status !== 'All') {
              drives = drives.filter(
                (d) => d.status && d.status.toUpperCase() === query.status.toUpperCase()
              );
            }
            if (query.company) {
              drives = drives.filter((d) => String(d.company?._id || d.company) === String(query.company));
            }
            if (query.eligibleDepartments && typeof query.eligibleDepartments === 'string') {
              drives = drives.filter(
                (d) =>
                  Array.isArray(d.eligibleDepartments) &&
                  d.eligibleDepartments.some((dept) =>
                    dept.toLowerCase().includes(query.eligibleDepartments.toLowerCase())
                  )
              );
            }
            if (query.$or && Array.isArray(query.$or)) {
              drives = drives.filter((d) => {
                return query.$or.some((condition) => {
                  const [field, rule] = Object.entries(condition)[0] || [];
                  if (!field || !rule) return false;
                  const val = d[field];
                  if (!val) return false;
                  if (rule instanceof RegExp) {
                    return rule.test(String(val));
                  }
                  if (typeof rule === 'string') {
                    return String(val).toLowerCase().includes(rule.toLowerCase());
                  }
                  return false;
                });
              });
            }
          }

          // Sort
          const key = this._sortKey;
          const order = this._sortOrder;
          drives.sort((a, b) => {
            const valA = a[key] ?? '';
            const valB = b[key] ?? '';
            if (valA < valB) return -1 * order;
            if (valA > valB) return 1 * order;
            return 0;
          });

          // Always populate company info
          const populated = await Promise.all(drives.map(attachCompanyInfo));
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
      _populateField: null,
      populate(field) {
        this._populateField = field;
        return this;
      },
      async then(resolve, reject) {
        try {
          const drives = readDrives();
          const drive = drives.find((d) => String(d._id) === String(id));
          if (!drive) return resolve(null);
          const populated = await attachCompanyInfo(drive);
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
    const drives = readDrives();
    const now = new Date().toISOString();
    const newDrive = {
      _id: data._id || crypto.randomBytes(12).toString('hex'),
      company: data.company,
      jobRole: data.jobRole?.trim() || '',
      jobDescription: data.jobDescription?.trim() || '',
      salaryPackage: data.salaryPackage?.trim() || '',
      eligibleDepartments: Array.isArray(data.eligibleDepartments)
        ? data.eligibleDepartments.map((d) => d.trim()).filter(Boolean)
        : [],
      minimumCGPA: Number(data.minimumCGPA) || 0,
      maximumBacklogs: Number(data.maximumBacklogs) || 0,
      graduationYear: Number(data.graduationYear) || new Date().getFullYear(),
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : null,
      driveDate: data.driveDate ? new Date(data.driveDate).toISOString() : null,
      status: (data.status || 'UPCOMING').toUpperCase(),
      createdBy: data.createdBy || null,
      createdAt: now,
      updatedAt: now,
    };

    drives.unshift(newDrive);
    writeDrives(drives);
    return await attachCompanyInfo(newDrive);
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    const drives = readDrives();
    const index = drives.findIndex((d) => String(d._id) === String(id));
    if (index === -1) return null;

    const existing = drives[index];
    const incoming = updateData.$set ? { ...updateData.$set } : { ...updateData };
    delete incoming._id;
    delete incoming.createdAt;

    const updated = {
      ...existing,
      ...incoming,
      company: incoming.company !== undefined ? incoming.company : existing.company,
      jobRole: incoming.jobRole !== undefined ? incoming.jobRole.trim() : existing.jobRole,
      jobDescription: incoming.jobDescription !== undefined ? incoming.jobDescription.trim() : existing.jobDescription,
      salaryPackage: incoming.salaryPackage !== undefined ? incoming.salaryPackage.trim() : existing.salaryPackage,
      eligibleDepartments: incoming.eligibleDepartments !== undefined
        ? (Array.isArray(incoming.eligibleDepartments) ? incoming.eligibleDepartments.map((d) => d.trim()).filter(Boolean) : existing.eligibleDepartments)
        : existing.eligibleDepartments,
      minimumCGPA: incoming.minimumCGPA !== undefined ? Number(incoming.minimumCGPA) : existing.minimumCGPA,
      maximumBacklogs: incoming.maximumBacklogs !== undefined ? Number(incoming.maximumBacklogs) : existing.maximumBacklogs,
      graduationYear: incoming.graduationYear !== undefined ? Number(incoming.graduationYear) : existing.graduationYear,
      applicationDeadline: incoming.applicationDeadline !== undefined ? new Date(incoming.applicationDeadline).toISOString() : existing.applicationDeadline,
      driveDate: incoming.driveDate !== undefined ? new Date(incoming.driveDate).toISOString() : existing.driveDate,
      status: incoming.status !== undefined ? incoming.status.toUpperCase() : existing.status,
      updatedAt: new Date().toISOString(),
    };

    drives[index] = updated;
    writeDrives(drives);
    return await attachCompanyInfo(updated);
  },

  async findByIdAndDelete(id) {
    const drives = readDrives();
    const index = drives.findIndex((d) => String(d._id) === String(id));
    if (index === -1) return null;

    const [deleted] = drives.splice(index, 1);
    writeDrives(drives);
    return deleted;
  },

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  },
};
