import React from 'react';
import {
  FileText,
  Upload,
  Download,
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const ResumeSection = ({ resume, onUpdateResume, onDeleteResume }) => {
  const hasResume = resume?.url && resume.url.trim().length > 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Resume</h2>
            <p className="text-xs text-slate-400">
              Your placement-ready CV or resume link for job applications.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {hasResume ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Missing
          </span>
        )}
      </div>

      {hasResume ? (
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Resume icon */}
              <div className="w-12 h-14 rounded-lg bg-gradient-to-b from-indigo-900/40 to-slate-900 border border-indigo-800/40 flex flex-col items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-indigo-400" />
                <span className="text-[9px] font-bold text-indigo-400 mt-0.5 tracking-widest">PDF</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-bold text-white">
                    {resume.fileName || 'Resume Document'}
                  </span>
                </div>
                {resume.updatedAt && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Last updated {formatDate(resume.updatedAt)}</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate max-w-xs">
                  {resume.url}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-all shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View
              </a>
              <button
                onClick={onUpdateResume}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Update
              </button>
              <button
                onClick={onDeleteResume}
                type="button"
                title="Remove Resume"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-300 mb-1">No Resume Uploaded</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
            Add a Google Drive, Notion, or any public link to your professional resume or CV.
          </p>
          <button
            onClick={onUpdateResume}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Resume Link
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
