import React from 'react';
import { Plus, Calendar, Link2, Edit3, Trash2, Award } from 'lucide-react';

const CertificationsSection = ({ certifications = [], onAddCert, onEditCert, onDeleteCert }) => {
  return (
    <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#E4E8EF]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[#202B3C]">Certifications</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#667085] border border-[#E2E8F0]">
              {certifications.length}
            </span>
          </div>
          <p className="text-xs text-[#667085]">Industry-recognized credentials that validate your expertise</p>
        </div>
        <button
          onClick={onAddCert}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={14} strokeWidth={1.8} />
          <span>Add Certification</span>
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFCFE]">
          <Award className="w-10 h-10 text-[#94A3B8] mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-[#202B3C] mb-1">No certifications added yet</p>
          <p className="text-xs text-[#667085] max-w-sm mx-auto mb-4 leading-relaxed">
            Add credentials from AWS, Google, Coursera, HackerRank, or authorized certification bodies.
          </p>
          <button
            onClick={onAddCert}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.8} />
            <span>Add Your First Certification</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div
              key={cert._id}
              className="p-4 rounded-xl bg-white border border-[#E4E8EF] hover:border-[#CBD5E1] transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FEFCE8] border border-[#FEF08A] flex items-center justify-center shrink-0 text-[#C58A25]">
                    <Award size={18} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#202B3C] truncate mb-0.5">{cert.title}</h3>
                    {cert.issuer && (
                      <p className="text-xs text-[#667085] font-medium mb-1.5">{cert.issuer}</p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-[#667085]">
                      {cert.issueDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} strokeWidth={1.8} className="text-[#94A3B8]" />
                          <span>{cert.issueDate}</span>
                        </span>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#3569A8] hover:text-[#19365C] font-medium"
                        >
                          <Link2 size={12} strokeWidth={1.8} />
                          <span>View Credential</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditCert(cert)}
                    type="button"
                    className="p-1.5 rounded-lg text-[#3569A8] hover:text-[#19365C] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                    title="Edit Certification"
                  >
                    <Edit3 size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => onDeleteCert(cert._id)}
                    type="button"
                    className="p-1.5 rounded-lg text-[#D14343] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                    title="Delete Certification"
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificationsSection;
