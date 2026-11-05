import React from 'react';
import {
  Building2,
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

const CompanyTableView = ({ companies, canManage, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white border border-[#E4E8EF] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#202B3C]">
          <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wider text-[#667085] border-b border-[#E4E8EF]">
            <tr>
              <th className="py-3.5 px-6 font-semibold">Company</th>
              <th className="py-3.5 px-6 font-semibold">Industry</th>
              <th className="py-3.5 px-6 font-semibold">Location</th>
              <th className="py-3.5 px-6 font-semibold">Contact Liaison</th>
              <th className="py-3.5 px-6 font-semibold">Website</th>
              <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF]">
            {companies.map((company) => (
              <tr
                key={company._id}
                id={`company-row-${company._id}`}
                className="hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Company Name & Initials */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#19365C] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(company.companyName)}
                    </div>
                    <div>
                      <button
                        onClick={() => onView(company)}
                        className="font-semibold text-[#202B3C] hover:text-[#3569A8] text-left transition-colors truncate max-w-[200px] block"
                      >
                        {company.companyName}
                      </button>
                      <span className="text-[11px] text-[#667085] font-mono">
                        {company._id.slice(-6)}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Industry */}
                <td className="py-4 px-6">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] whitespace-nowrap">
                    {company.industry}
                  </span>
                </td>

                {/* Location */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                    <MapPin className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                    <span className="truncate max-w-[180px]">{company.location}</span>
                  </div>
                </td>

                {/* Contact */}
                <td className="py-4 px-6">
                  <div className="text-xs">
                    <div className="font-medium text-[#202B3C] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#667085]" />
                      {company.contactPerson}
                    </div>
                    <a
                      href={`mailto:${company.contactEmail}`}
                      className="text-[#3569A8] hover:underline font-mono text-[11px] flex items-center gap-1 mt-0.5"
                    >
                      <Mail className="w-3 h-3 text-[#94A3B8]" />
                      {company.contactEmail}
                    </a>
                  </div>
                </td>

                {/* Website */}
                <td className="py-4 px-6">
                  {company.website ? (
                    <a
                      href={
                        company.website.startsWith('http')
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#3569A8] hover:underline font-medium"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">Visit</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  ) : (
                    <span className="text-xs text-[#94A3B8]">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      id={`table-view-btn-${company._id}`}
                      onClick={() => onView(company)}
                      className="p-1.5 rounded-lg text-[#667085] hover:text-[#202B3C] hover:bg-[#F1F5F9] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canManage && (
                      <>
                        <button
                          id={`table-edit-btn-${company._id}`}
                          onClick={() => onEdit(company)}
                          className="p-1.5 rounded-lg text-[#3569A8] hover:text-[#19365C] hover:bg-[#EFF6FF] transition-colors"
                          title="Edit Company"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`table-delete-btn-${company._id}`}
                          onClick={() => onDelete(company)}
                          className="p-1.5 rounded-lg text-[#D14343] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyTableView;
