import React from 'react';
import { FileText, Upload, ExternalLink, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const ResumeSection = ({ resume, onUpdateResume, onDeleteResume }) => {
  const hasResume = resume?.url && resume.url.trim().length > 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className="sd-section">
      <div className="sd-section__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <h2 className="sd-section__title">Resume</h2>
            {hasResume ? (
              <span className="sd-badge sd-badge--green" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Uploaded
              </span>
            ) : (
              <span className="sd-badge sd-badge--red" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle style={{ width: 11, height: 11 }} />
                Missing
              </span>
            )}
          </div>
          <p className="sd-section__sub">Your placement-ready CV or resume link for job applications</p>
        </div>
        <button onClick={onUpdateResume} type="button" className="sd-btn sd-btn--ghost">
          <Upload style={{ width: 14, height: 14 }} />
          {hasResume ? 'Update' : 'Upload Link'}
        </button>
      </div>

      {hasResume ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '14px',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '36px', height: '42px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileText style={{ width: 16, height: 16, color: '#818cf8' }} />
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#818cf8', letterSpacing: '0.1em', marginTop: '2px' }}>PDF</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <CheckCircle2 style={{ width: 13, height: 13, color: '#22c55e', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                  {resume.fileName || 'Resume Document'}
                </span>
              </div>
              {resume.updatedAt && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                  <Clock style={{ width: 11, height: 11 }} />
                  Updated {formatDate(resume.updatedAt)}
                </span>
              )}
              <p style={{ fontSize: '10px', color: '#334155', fontFamily: 'monospace', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                {resume.url}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <a href={resume.url} target="_blank" rel="noopener noreferrer" className="sd-btn sd-btn--ghost">
              <ExternalLink style={{ width: 13, height: 13 }} />
              View
            </a>
            <button onClick={onDeleteResume} type="button" title="Remove Resume"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px',
                background: 'none',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                fontSize: '12px', fontWeight: 500,
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#7f1d1d'; }}
              onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#1e293b'; }}>
              <Trash2 style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      ) : (
        <div className="sd-empty-state">
          <p className="sd-empty-state__title">No resume uploaded</p>
          <p className="sd-empty-state__body">
            Add a Google Drive, Notion, or any public link to your professional resume.
          </p>
          <button onClick={onUpdateResume} type="button" className="sd-btn sd-btn--primary" style={{ marginTop: '12px' }}>
            <Upload style={{ width: 14, height: 14 }} />
            Upload Resume Link
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
