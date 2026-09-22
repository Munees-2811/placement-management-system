import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const readUsers = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

export const localUserStore = {
  findOne(query) {
    let selectFields = null;

    const execute = async () => {
      const users = readUsers();
      const email = query?.email;
      if (!email) return null;

      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return null;

      const includePassword = typeof selectFields === 'string' && selectFields.includes('+password');
      const copy = { ...user };
      if (!includePassword) {
        delete copy.password;
      }

      return {
        ...copy,
        select(fields) {
          if (typeof fields === 'string' && fields.includes('+password')) {
            return {
              ...user,
              async matchPassword(enteredPassword) {
                return await bcrypt.compare(enteredPassword, user.password);
              },
            };
          }
          return copy;
        },
        async matchPassword(enteredPassword) {
          return await bcrypt.compare(enteredPassword, user.password);
        },
      };
    };

    const queryObj = {
      select(fields) {
        selectFields = fields;
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

  findById(id) {
    let selectFields = null;

    const execute = async () => {
      const users = readUsers();
      const user = users.find((u) => String(u._id) === String(id));
      if (!user) return null;

      const copy = { ...user };
      delete copy.password;
      return copy;
    };

    const queryObj = {
      select(fields) {
        selectFields = fields;
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

  async create({ name, email, password, role }) {
    const users = readUsers();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role ? role.toUpperCase() : 'STUDENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    const userObj = { ...newUser };
    delete userObj.password;
    return {
      ...userObj,
      async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, newUser.password);
      },
    };
  },
};
