import React, { useState } from 'react';
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  Globe,
  Mail,
  User,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  Calendar,
} from 'lucide-react';

const CompanyDetailModal = ({ isOpen, onClose, company, canManage, onEdit }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !company) return null;

  const handleCopyEmail = () => {
    if (company.contactEmail) {
      navigator.clipboard.writeText(company.contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'CO';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formattedDate = company.createdAt
    ? new Date(company.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      id="company-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="company-detail-dialog"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Top Header Banner */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/40 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                {getInitials(company.companyName)}
              </div>
              <div>
                <h2 id="company-detail-name" className="text-2xl font-bold text-white tracking-tight">
                  {company.companyName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    <Briefcase className="w-3 h-3" />
                    {company.industry}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    {company.location}
                  </span>
                </div>
              </div>
            </div>
            <button
              id="company-detail-close-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Website Link if present */}
          {company.website && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs text-slate-400 font-medium">Official Website:</span>
                <span className="text-xs font-mono text-indigo-300 truncate">
                  {company.website}
                </span>
              </div>
              <a
                id="company-detail-website-link"
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors shrink-0"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Company Overview & Profile
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {company.description || (
                <span className="text-slate-500 italic">No detailed description provided.</span>
              )}
            </div>
          </div>

          {/* Recruiter / Placement Contact Card */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Placement Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                  Contact Person
                </span>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <User className="w-4 h-4 text-violet-400" />
                  <span>{company.contactPerson}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="overflow-hidden">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Contact Email
                  </span>
                  <a
                    id="company-detail-email-link"
                    href={`mailto:${company.contactEmail}`}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200 truncate"
                  >
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{company.contactEmail}</span>
                  </a>
                </div>
                <button
                  id="company-detail-copy-email-btn"
                  onClick={handleCopyEmail}
                  className="p-2 ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  title="Copy email"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          {formattedDate && (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Partner registered on {formattedDate}
              </span>
              <span className="font-mono text-[11px]">ID: {company._id}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            id="company-detail-close-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {canManage && (
            <button
              id="company-detail-edit-shortcut-btn"
              onClick={() => {
                onClose();
                onEdit(company);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all hover:scale-[1.02] shadow-md shadow-indigo-600/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Company</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailModal;
