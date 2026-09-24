import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  Globe,
  User,
  Mail,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const COMMON_INDUSTRIES = [
  'Technology & Cloud Computing',
  'Software & SaaS',
  'Financial Services & Fintech',
  'E-Commerce & Retail',
  'Consulting & Professional Services',
  'Automotive & Clean Energy',
  'Healthcare & Life Sciences',
  'Hardware & Semiconductor',
  'Telecommunications',
];

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;

const CompanyModal = ({ isOpen, onClose, onSave, company, saving }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    location: '',
    website: '',
    description: '',
    contactPerson: '',
    contactEmail: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        industry: company.industry || '',
        location: company.location || '',
        website: company.website || '',
        description: company.description || '',
        contactPerson: company.contactPerson || '',
        contactEmail: company.contactEmail || '',
      });
    } else {
      setFormData({
        companyName: '',
        industry: '',
        location: '',
        website: '',
        description: '',
        contactPerson: '',
        contactEmail: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [company, isOpen]);

  if (!isOpen) return null;

  const validateField = (name, value) => {
    switch (name) {
      case 'companyName':
        if (!value.trim()) return 'Company name is required';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        if (value.trim().length > 120) return 'Cannot exceed 120 characters';
        return null;
      case 'industry':
        if (!value.trim()) return 'Industry is required';
        if (value.trim().length > 100) return 'Cannot exceed 100 characters';
        return null;
      case 'location':
        if (!value.trim()) return 'Location is required';
        if (value.trim().length > 120) return 'Cannot exceed 120 characters';
        return null;
      case 'contactPerson':
        if (!value.trim()) return 'Contact person name is required';
        if (value.trim().length > 100) return 'Cannot exceed 100 characters';
        return null;
      case 'contactEmail':
        if (!value.trim()) return 'Contact email is required';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
        return null;
      case 'website':
        if (value.trim() && !URL_REGEX.test(value.trim())) {
          return 'Please enter a valid website address';
        }
        return null;
      case 'description':
        if (value.length > 2000) return 'Description cannot exceed 2000 characters';
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setTouched({
      companyName: true,
      industry: true,
      location: true,
      website: true,
      description: true,
      contactPerson: true,
      contactEmail: true,
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const isEdit = Boolean(company);

  return (
    <div
      id="company-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        id="company-modal-dialog"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="company-modal-title" className="text-xl font-bold text-white tracking-tight">
                {isEdit ? 'Edit Company Profile' : 'Add New Partner Company'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit
                  ? 'Update recruiting company details, contacts, and domain'
                  : 'Register a new hiring partner for campus placement drives'}
              </p>
            </div>
          </div>
          <button
            id="company-modal-close-btn"
            onClick={onClose}
            disabled={saving}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Company Name */}
          <div>
            <label htmlFor="company-input-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Company Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                id="company-input-name"
                name="companyName"
                type="text"
                placeholder="e.g. Google India, Infosys, Zoho"
                value={formData.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.companyName
                    ? 'border-rose-500/60 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
            </div>
            {errors.companyName && (
              <p id="company-error-name" className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.companyName}
              </p>
            )}
          </div>

          {/* Industry and Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Industry */}
            <div>
              <label htmlFor="company-input-industry" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Industry <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  id="company-input-industry"
                  name="industry"
                  type="text"
                  placeholder="e.g. Software & Cloud"
                  value={formData.industry}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.industry
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.industry && (
                <p id="company-error-industry" className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.industry}
                </p>
              )}
              {/* Quick suggestions */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMMON_INDUSTRIES.slice(0, 3).map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => {
                      setFormData((p) => ({ ...p, industry: ind }));
                      setErrors((p) => ({ ...p, industry: null }));
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/50"
                  >
                    + {ind.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="company-input-location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Location <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="company-input-location"
                  name="location"
                  type="text"
                  placeholder="e.g. Bengaluru, Karnataka, India"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.location
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.location && (
                <p id="company-error-location" className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="company-input-website" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Website URL <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                id="company-input-website"
                name="website"
                type="text"
                placeholder="https://example.com or company.com"
                value={formData.website}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.website
                    ? 'border-rose-500/60 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              {formData.website && !errors.website && (
                <a
                  href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-indigo-400 hover:text-indigo-300"
                  title="Test link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {errors.website && (
              <p id="company-error-website" className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.website}
              </p>
            )}
          </div>

          {/* Contact Person and Contact Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Person */}
            <div>
              <label htmlFor="company-input-contact-person" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contact Person <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="company-input-contact-person"
                  name="contactPerson"
                  type="text"
                  placeholder="e.g. John Doe (Campus HR)"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.contactPerson
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.contactPerson && (
                <p id="company-error-contact-person" className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.contactPerson}
                </p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="company-input-contact-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contact Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="company-input-contact-email"
                  name="contactEmail"
                  type="email"
                  placeholder="recruiter@company.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.contactEmail
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.contactEmail && (
                <p id="company-error-contact-email" className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.contactEmail}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="company-input-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Company Description <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <span className={`text-[11px] ${formData.description.length > 2000 ? 'text-rose-400' : 'text-slate-500'}`}>
                {formData.description.length} / 2000
              </span>
            </div>
            <div className="relative">
              <textarea
                id="company-input-description"
                name="description"
                rows={3}
                placeholder="Overview of company culture, recruitment specializations, perks, and domain focus..."
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.description
                    ? 'border-rose-500/60 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
            </div>
            {errors.description && (
              <p id="company-error-description" className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              id="company-modal-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="company-modal-submit-btn"
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEdit ? 'Saving Changes...' : 'Creating Company...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Company'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyModal;
