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

const getInitials = (name) => {
  if (!name) return 'CO';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const CompanyCard = ({ company, canManage, onEdit, onDelete, onView }) => {
  return (
    <div
      id={`company-card-${company._id}`}
      className="group relative bg-white border border-[#E4E8EF] hover:border-[#CBD5E1] rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Avatar + Title & Location */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#19365C] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
            {getInitials(company.companyName)}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id={`company-name-${company._id}`}
              onClick={() => onView(company)}
              className="text-base font-bold text-[#202B3C] group-hover:text-[#3569A8] transition-colors cursor-pointer truncate leading-tight"
              title={company.companyName}
            >
              {company.companyName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#667085] mt-1">
              <MapPin size={13} strokeWidth={1.8} className="text-[#3569A8] shrink-0" />
              <span className="truncate" title={company.location}>
                {company.location}
              </span>
            </div>
          </div>
        </div>

        {/* Industry Badge */}
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE] max-w-full"
            title={company.industry}
          >
            <Briefcase size={12} strokeWidth={1.8} className="shrink-0 text-[#3569A8]" />
            <span className="truncate">{company.industry}</span>
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-[#667085] line-clamp-2 mb-4 leading-relaxed min-h-[36px]">
          {company.description || 'No detailed organization overview provided.'}
        </p>

        {/* Contact info card */}
        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E8EF] mb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-[#202B3C]">
            <User size={13} strokeWidth={1.8} className="text-[#3569A8] shrink-0" />
            <span className="font-medium truncate">{company.contactPerson || 'Recruitment Coordinator'}</span>
          </div>
          <div className="flex items-center text-xs">
            <a
              id={`company-email-link-${company._id}`}
              href={`mailto:${company.contactEmail}`}
              className="flex items-center gap-2 text-[#3569A8] hover:text-[#19365C] truncate font-mono text-[11px]"
              title={company.contactEmail}
            >
              <Mail size={13} strokeWidth={1.8} className="shrink-0 text-[#94A3B8]" />
              <span className="truncate">{company.contactEmail}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#E4E8EF] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {company.website ? (
            <a
              id={`company-website-btn-${company._id}`}
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#202B3C] text-xs font-medium transition-colors"
              title="Visit official website"
            >
              <Globe size={13} strokeWidth={1.8} className="text-[#3569A8]" />
              <span>Website</span>
              <ExternalLink size={11} strokeWidth={1.8} className="ml-0.5 opacity-60" />
            </a>
          ) : (
            <span className="text-[11px] text-[#94A3B8]">No website listed</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Details */}
          <button
            id={`company-view-btn-${company._id}`}
            onClick={() => onView(company)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#3569A8] hover:text-[#19365C] hover:bg-[#EFF6FF] border border-[#BFDBFE] transition-colors cursor-pointer"
            title="View full company details"
          >
            <Eye size={13} strokeWidth={1.8} />
            <span>View Details</span>
          </button>

          {/* Admin / Officer Controls */}
          {canManage && (
            <>
              <button
                id={`company-edit-btn-${company._id}`}
                onClick={() => onEdit(company)}
                className="p-1 rounded-md text-[#3569A8] hover:bg-[#EFF6FF] border border-transparent hover:border-[#BFDBFE] transition-colors cursor-pointer"
                title="Edit Company"
              >
                <Edit3 size={14} strokeWidth={1.8} />
              </button>
              <button
                id={`company-delete-btn-${company._id}`}
                onClick={() => onDelete(company)}
                className="p-1 rounded-md text-[#D14343] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors cursor-pointer"
                title="Delete Company"
              >
                <Trash2 size={14} strokeWidth={1.8} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
