import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'student_profiles.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const readProfiles = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeProfiles = (profiles) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2));
};

export const calculateCompletionPercentage = (profile) => {
  let score = 0;
  const breakdown = {
    phone: false,
    department: false,
    batch: false,
    cgpa: false,
    skills: false,
    projects: false,
    certifications: false,
    resume: false,
  };

  if (profile?.phone && profile.phone.trim().length >= 7) {
    score += 10;
    breakdown.phone = true;
  }
  if (profile?.department && profile.department.trim().length > 0) {
    score += 10;
    breakdown.department = true;
  }
  if (profile?.batch && profile.batch.trim().length > 0) {
    score += 10;
    breakdown.batch = true;
  }
  if (profile?.cgpa !== undefined && profile?.cgpa !== null && profile.cgpa > 0) {
    score += 15;
    breakdown.cgpa = true;
  }
  if (Array.isArray(profile?.skills) && profile.skills.length > 0) {
    score += 15;
    breakdown.skills = true;
  }
  if (Array.isArray(profile?.projects) && profile.projects.length > 0) {
    score += 20;
    breakdown.projects = true;
  }
  if (Array.isArray(profile?.certifications) && profile.certifications.length > 0) {
    score += 10;
    breakdown.certifications = true;
  }
  if (profile?.resume?.url && profile.resume.url.trim().length > 0) {
    score += 10;
    breakdown.resume = true;
  }

  return {
    percentage: Math.min(100, score),
    breakdown,
  };
};

export const localStudentProfileStore = {
  findOne(query) {
    const execute = async () => {
      const profiles = readProfiles();
      const userId = query?.user?.toString ? query.user.toString() : query?.user;
      if (!userId) return null;

      const profile = profiles.find((p) => String(p.user) === String(userId));
      if (!profile) return null;

      const stats = calculateCompletionPercentage(profile);
      return {
        ...profile,
        completionPercentage: stats.percentage,
        completionBreakdown: stats.breakdown,
      };
    };

    const queryObj = {
      populate() {
        return queryObj;
      },
      lean() {
        return queryObj;
      },
      then(onFulfilled, onRejected) {
        return execute().then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return execute().catch(onRejected);
      },
    };

    return queryObj;
  },

  async findOneAndUpdate(query, updateData, options = { new: true, upsert: true }) {
    const profiles = readProfiles();
    const userId = query?.user?.toString ? query.user.toString() : query?.user;
    if (!userId) return null;

    let index = profiles.findIndex((p) => String(p.user) === String(userId));
    let profile;

    if (index === -1) {
      if (!options.upsert) return null;
      profile = {
        _id: new mongoose.Types.ObjectId().toString(),
        user: userId,
        phone: '',
        department: '',
        batch: '',
        cgpa: null,
        backlogs: 0,
        bio: '',
        skills: [],
        projects: [],
        certifications: [],
        resume: {
          url: '',
          fileName: '',
          updatedAt: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      profiles.push(profile);
      index = profiles.length - 1;
    } else {
      profile = profiles[index];
    }

    const updates = updateData.$set ? updateData.$set : updateData;

    // Handle updates
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'user') {
        profile[key] = updates[key];
      }
    });

    profile.updatedAt = new Date().toISOString();
    profiles[index] = profile;
    writeProfiles(profiles);

    const stats = calculateCompletionPercentage(profile);
    return {
      ...profile,
      completionPercentage: stats.percentage,
      completionBreakdown: stats.breakdown,
    };
  },

  async create(data) {
    const profiles = readProfiles();
    const newProfile = {
      _id: new mongoose.Types.ObjectId().toString(),
      user: data.user?.toString ? data.user.toString() : data.user,
      phone: data.phone || '',
      department: data.department || '',
      batch: data.batch || '',
      cgpa: data.cgpa ?? null,
      backlogs: data.backlogs ?? 0,
      bio: data.bio || '',
      skills: Array.isArray(data.skills) ? data.skills : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      resume: data.resume || { url: '', fileName: '', updatedAt: null },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    profiles.push(newProfile);
    writeProfiles(profiles);

    const stats = calculateCompletionPercentage(newProfile);
    return {
      ...newProfile,
      completionPercentage: stats.percentage,
      completionBreakdown: stats.breakdown,
    };
  },
};
