import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'companies.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const readCompanies = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeCompanies = (companies) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(companies, null, 2));
};

export const localCompanyStore = {
  find(query = {}) {
    const chainable = {
      _sortKey: 'createdAt',
      _sortOrder: -1,
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
      async then(resolve, reject) {
        try {
          let companies = readCompanies();

          // Search / filter matching
          if (query && typeof query === 'object') {
            if (query._id) {
              companies = companies.filter((c) => String(c._id) === String(query._id));
            }
            if (query.industry && typeof query.industry === 'string') {
              companies = companies.filter(
                (c) => c.industry && c.industry.toLowerCase() === query.industry.toLowerCase()
              );
            }
            if (query.$or && Array.isArray(query.$or)) {
              // Regex or partial text search
              companies = companies.filter((c) => {
                return query.$or.some((condition) => {
                  const [field, rule] = Object.entries(condition)[0] || [];
                  if (!field || !rule) return false;
                  const val = c[field];
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
          companies.sort((a, b) => {
            const valA = a[key] ?? '';
            const valB = b[key] ?? '';
            if (valA < valB) return -1 * order;
            if (valA > valB) return 1 * order;
            return 0;
          });

          resolve(companies);
        } catch (err) {
          reject(err);
        }
      },
    };

    return chainable;
  },

  async findById(id) {
    const companies = readCompanies();
    const company = companies.find((c) => String(c._id) === String(id));
    return company ? { ...company } : null;
  },

  async findOne(query) {
    const companies = readCompanies();
    if (query._id) {
      const match = companies.find((c) => String(c._id) === String(query._id));
      return match ? { ...match } : null;
    }
    if (query.companyName) {
      const targetName = typeof query.companyName === 'string' ? query.companyName.toLowerCase() : '';
      const match = companies.find((c) => c.companyName && c.companyName.toLowerCase() === targetName);
      return match ? { ...match } : null;
    }
    return companies[0] ? { ...companies[0] } : null;
  },

  async create(data) {
    const companies = readCompanies();
    const now = new Date().toISOString();
    const newCompany = {
      _id: data._id || crypto.randomBytes(12).toString('hex'),
      companyName: data.companyName?.trim() || '',
      industry: data.industry?.trim() || '',
      location: data.location?.trim() || '',
      website: data.website?.trim() || '',
      description: data.description?.trim() || '',
      contactPerson: data.contactPerson?.trim() || '',
      contactEmail: data.contactEmail?.trim()?.toLowerCase() || '',
      createdBy: data.createdBy || null,
      createdAt: now,
      updatedAt: now,
    };

    companies.unshift(newCompany);
    writeCompanies(companies);
    return { ...newCompany };
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    const companies = readCompanies();
    const index = companies.findIndex((c) => String(c._id) === String(id));
    if (index === -1) return null;

    const existing = companies[index];
    const incoming = updateData.$set ? { ...updateData.$set } : { ...updateData };
    delete incoming._id;
    delete incoming.createdAt;

    const updated = {
      ...existing,
      ...incoming,
      companyName: incoming.companyName !== undefined ? incoming.companyName.trim() : existing.companyName,
      industry: incoming.industry !== undefined ? incoming.industry.trim() : existing.industry,
      location: incoming.location !== undefined ? incoming.location.trim() : existing.location,
      website: incoming.website !== undefined ? incoming.website.trim() : existing.website,
      description: incoming.description !== undefined ? incoming.description.trim() : existing.description,
      contactPerson: incoming.contactPerson !== undefined ? incoming.contactPerson.trim() : existing.contactPerson,
      contactEmail: incoming.contactEmail !== undefined ? incoming.contactEmail.trim().toLowerCase() : existing.contactEmail,
      updatedAt: new Date().toISOString(),
    };

    companies[index] = updated;
    writeCompanies(companies);
    return { ...updated };
  },

  async findByIdAndDelete(id) {
    const companies = readCompanies();
    const index = companies.findIndex((c) => String(c._id) === String(id));
    if (index === -1) return null;

    const [deleted] = companies.splice(index, 1);
    writeCompanies(companies);
    return { ...deleted };
  },

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  },
};
