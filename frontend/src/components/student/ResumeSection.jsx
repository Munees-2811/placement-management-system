import React from 'react';
import { FileText, Upload, ExternalLink, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const getFormatInfo = (fileName, url) => {
  const name = (fileName || url || '').toLowerCase();
  if (name.includes('.docx') || name.includes('.doc')) {
    return { label: 'DOCX', color: '#3569A8' };
  }
  if (name.includes('.pdf')) {
    return { label: 'PDF', color: '#D14343' };
  }
  return { label: 'PDF', color: '#D14343' };
};

const ResumeSection = ({ resume, onUpdateResume, onDeleteResume }) => {
  const hasResume = resume?.url && resume.url.trim().length > 0;
  const formatInfo = getFormatInfo(resume?.fileName, resume?.url);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#E4E8EF]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[#202B3C]">Resume Document</h2>
            {hasResume ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
                Uploaded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF2F2] text-[#D14343] border border-[#FECACA]">
                <AlertCircle size={11} strokeWidth={1.8} />
                Missing
              </span>
            )}
          </div>
          <p className="text-xs text-[#667085]">Upload your resume as a PDF file (max 5 MB) for campus recruiters</p>
        </div>
        <button
          onClick={onUpdateResume}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Upload size={14} strokeWidth={1.8} className="text-[#3569A8]" />
          <span>{hasResume ? 'Replace PDF' : 'Upload PDF'}</span>
        </button>
      </div>

      {hasResume ? (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E4E8EF]">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-10 h-12 rounded-lg bg-[#F8FAFC] border border-[#E4E8EF] flex flex-col items-center justify-center shrink-0">
              <FileText size={18} strokeWidth={1.8} style={{ color: formatInfo.color }} />
              <span className="text-[9px] font-bold tracking-wider mt-0.5" style={{ color: formatInfo.color }}>
                {formatInfo.label}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={15} strokeWidth={1.8} className="text-[#16845B] shrink-0" />
                <span className="text-sm font-semibold text-[#202B3C] truncate">
                  {resume.fileName || 'Resume Document'}
                </span>
              </div>
              {resume.updatedAt && (
                <div className="flex items-center gap-1 text-xs text-[#667085]">
                  <Clock size={12} strokeWidth={1.8} className="text-[#94A3B8]" />
                  <span>Updated {formatDate(resume.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#3569A8] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-xs font-semibold transition-colors"
            >
              <ExternalLink size={13} strokeWidth={1.8} />
              <span>View</span>
            </a>
            <button
              onClick={onDeleteResume}
              type="button"
              title="Remove Resume"
              className="p-1.5 rounded-lg text-[#D14343] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              <Trash2 size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFCFE]">
          <FileText className="w-10 h-10 text-[#94A3B8] mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-[#202B3C] mb-1">No resume uploaded</p>
          <p className="text-xs text-[#667085] max-w-sm mx-auto mb-4 leading-relaxed">
            Upload your resume as a <strong className="text-[#D14343]">PDF file</strong> (max 5 MB). It will be saved and visible to campus interviewers.
          </p>
          <button
            onClick={onUpdateResume}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload size={14} strokeWidth={1.8} />
            <span>Upload PDF Resume</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
