import React from 'react';
import {
  Building2,
  Briefcase,
  MapPin,
  Globe,
  Mail,
  User,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
} from 'lucide-react';

const GRADIENTS = [
  'from-indigo-600 to-violet-600',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-violet-600 to-purple-600',
  'from-amber-600 to-orange-600',
  'from-rose-600 to-pink-600',
];

const getInitials = (name) => {
  if (!name) return 'CO';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getGradientForName = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

const CompanyCard = ({ company, canManage, onEdit, onDelete, onView }) => {
  const gradient = getGradientForName(company.companyName);

  return (
    <div
      id={`company-card-${company._id}`}
      className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} text-white font-bold text-base flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 shrink-0`}
            >
              {getInitials(company.companyName)}
            </div>
            <div>
              <h3
                id={`company-name-${company._id}`}
                onClick={() => onView(company)}
                className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-1"
                title={company.companyName}
              >
                {company.companyName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate max-w-[200px]" title={company.location}>
                  {company.location}
                </span>
              </div>
            </div>
          </div>

          {/* Industry Tag */}
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {company.industry}
          </span>
        </div>

        {/* Description snippet */}
        {company.description ? (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {company.description}
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic mb-4">No description provided.</p>
        )}

        {/* Contact info pill */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/70 mb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="font-medium text-slate-200 truncate">{company.contactPerson}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <a
              id={`company-email-link-${company._id}`}
              href={`mailto:${company.contactEmail}`}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 truncate"
              title={company.contactEmail}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate font-mono text-[11px]">{company.contactEmail}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {company.website ? (
            <a
              id={`company-website-btn-${company._id}`}
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              title="Visit official website"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Website</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </a>
          ) : (
            <span className="text-[11px] text-slate-600">No website</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Details Modal Trigger */}
          <button
            id={`company-view-btn-${company._id}`}
            onClick={() => onView(company)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Admin / Officer Controls */}
          {canManage && (
            <>
              <button
                id={`company-edit-btn-${company._id}`}
                onClick={() => onEdit(company)}
                className="p-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/10 transition-colors"
                title="Edit Company"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                id={`company-delete-btn-${company._id}`}
                onClick={() => onDelete(company)}
                className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                title="Delete Company"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
