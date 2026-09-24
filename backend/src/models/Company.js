import mongoose from 'mongoose';
import { localCompanyStore } from './companyStore.js';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters long'],
      maxlength: [120, 'Company name cannot exceed 120 characters'],
      index: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    website: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v || v.trim() === '') return true;
          // Valid URL validator supporting http://, https://, or www.
          return /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i.test(
            v
          );
        },
        message: 'Please provide a valid website URL',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
      maxlength: [100, 'Contact person name cannot exceed 100 characters'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid contact email address',
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Search index for text searches
companySchema.index({
  companyName: 'text',
  industry: 'text',
  location: 'text',
});

const MongooseCompany = mongoose.model('Company', companySchema);

// Hybrid Company Model: transparently uses MongoDB when connected, falls back to localCompanyStore when offline
const Company = {
  get schema() {
    return MongooseCompany.schema;
  },

  find(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseCompany.find(...args);
    }
    return localCompanyStore.find(...args);
  },

  findById(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseCompany.findById(...args);
    }
    return localCompanyStore.findById(...args);
  },

  findOne(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseCompany.findOne(...args);
    }
    return localCompanyStore.findOne(...args);
  },

  create(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseCompany.create(...args);
    }
    return localCompanyStore.create(...args);
  },

  findByIdAndUpdate(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseCompany.findByIdAndUpdate(...args);
    }
    return localCompanyStore.findByIdAndUpdate(...args);
  },

  findByIdAndDelete(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseCompany.findByIdAndDelete(...args);
    }
    return localCompanyStore.findByIdAndDelete(...args);
  },

  countDocuments(...args) {
    if (mongoose.connection.readyState === 1) {
      return MongooseCompany.countDocuments(...args);
    }
    return localCompanyStore.countDocuments(...args);
  },
};

export { companySchema, MongooseCompany };
export default Company;
