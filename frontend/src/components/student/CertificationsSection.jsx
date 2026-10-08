import React from 'react';
import { Plus, Calendar, Link2, Edit2, Trash2, BadgeCheck } from 'lucide-react';

const CertificationsSection = ({ certifications = [], onAddCert, onEditCert, onDeleteCert }) => {
  return (
    <div className="sd-section">
      <div className="sd-section__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <h2 className="sd-section__title">Certifications</h2>
            <span className="sd-badge sd-badge--neutral">{certifications.length}</span>
          </div>
          <p className="sd-section__sub">Industry-recognized credentials that strengthen your profile</p>
        </div>
        <button onClick={onAddCert} type="button" className="sd-btn sd-btn--primary">
          <Plus style={{ width: 14, height: 14 }} />
          Add Cert
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="sd-empty-state">
          <p className="sd-empty-state__title">No certifications added yet</p>
          <p className="sd-empty-state__body">
            Add certificates from AWS, Google, Coursera, HackerRank or any recognized authority.
          </p>
          <button onClick={onAddCert} type="button" className="sd-btn sd-btn--ghost" style={{ marginTop: '12px' }}>
            <Plus style={{ width: 14, height: 14 }} />
            Add your first certification
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            padding: '6px 12px',
            background: '#0f172a',
            borderRadius: '8px 8px 0 0',
            border: '1px solid #1e293b',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Certification</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</span>
          </div>
          {certifications.map((cert, idx) => (
            <div
              key={cert._id}
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderTop: 'none',
                borderRadius: idx === certifications.length - 1 ? '0 0 8px 8px' : '0',
                padding: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                <BadgeCheck style={{ width: 15, height: 15, color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', marginBottom: '2px' }}>{cert.title}</p>
                  {cert.issuer && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{cert.issuer}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {cert.issueDate && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                        <Calendar style={{ width: 11, height: 11 }} />
                        {cert.issueDate}
                      </span>
                    )}
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#818cf8', textDecoration: 'none' }}
                        onMouseOver={e => e.currentTarget.style.color = '#a5b4fc'}
                        onMouseOut={e => e.currentTarget.style.color = '#818cf8'}>
                        <Link2 style={{ width: 11, height: 11 }} />
                        View Credential
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                <button onClick={() => onEditCert(cert)} title="Edit"
                  style={{ padding: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', borderRadius: '5px', transition: 'all 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = '#1e293b'; }}
                  onMouseOut={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'none'; }}>
                  <Edit2 style={{ width: 14, height: 14 }} />
                </button>
                <button onClick={() => onDeleteCert(cert._id)} title="Delete"
                  style={{ padding: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', borderRadius: '5px', transition: 'all 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = '#1e293b'; }}
                  onMouseOut={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'none'; }}>
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificationsSection;
