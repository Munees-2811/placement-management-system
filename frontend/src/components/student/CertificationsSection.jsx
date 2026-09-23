import React from 'react';
import { BadgeCheck, Plus, Calendar, Link2, Edit2, Trash2, Award } from 'lucide-react';

const CertificationsSection = ({ certifications = [], onAddCert, onEditCert, onDeleteCert }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/20">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Certifications</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {certifications.length} Earned
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Add industry-recognized certificates to strengthen your placement profile.
            </p>
          </div>
        </div>

        <button
          onClick={onAddCert}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
          <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300 mb-1">No Certifications Added Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Add certificates from platforms like AWS, Coursera, Google, HackerRank, or any recognized authority.
          </p>
          <button
            onClick={onAddCert}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Your First Certification</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div
              key={cert._id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all group shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0 mt-0.5">
                    <BadgeCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                      {cert.title}
                    </h3>
                    {cert.issuer && (
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{cert.issuer}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {cert.issueDate && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {cert.issueDate}
                        </span>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Link2 className="w-3 h-3" />
                          View Credential
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditCert(cert)}
                    title="Edit Certification"
                    className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCert(cert._id)}
                    title="Delete Certification"
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
