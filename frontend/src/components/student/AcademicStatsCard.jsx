import React from 'react';
import { Edit3, Award, BookOpen, Calendar, Phone, AlertTriangle, UserCheck } from 'lucide-react';

const AcademicStatsCard = ({ profile, onEdit }) => {
  const cgpa = profile?.cgpa !== null && profile?.cgpa !== undefined
    ? Number(profile.cgpa).toFixed(2)
    : null;

  const getCgpaStatus = (val) => {
    if (!val) return { label: 'Not set', cls: 'sd-badge--neutral' };
    const n = Number(val);
    if (n >= 9.0) return { label: 'Outstanding', cls: 'sd-badge--green' };
    if (n >= 8.0) return { label: 'Distinction', cls: 'sd-badge--blue' };
    if (n >= 7.0) return { label: 'First Class', cls: 'sd-badge--teal' };
    if (n >= 6.0) return { label: 'Second Class', cls: 'sd-badge--amber' };
    return { label: 'Eligible', cls: 'sd-badge--neutral' };
  };

  const backlogs = profile?.backlogs ?? 0;
  const cgpaStatus = getCgpaStatus(cgpa);

  const fields = [
    {
      icon: <Award style={{ width: 14, height: 14, color: '#f59e0b' }} />,
      label: 'CGPA',
      value: cgpa ? (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px' }}>{cgpa}</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>/ 10.0</span>
        </span>
      ) : <span style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>Not set</span>,
      badge: <span className={`sd-badge ${cgpaStatus.cls}`}>{cgpaStatus.label}</span>,
    },
    {
      icon: <AlertTriangle style={{ width: 14, height: 14, color: backlogs === 0 ? '#22c55e' : backlogs <= 2 ? '#f59e0b' : '#ef4444' }} />,
      label: 'Backlogs',
      value: (
        <span style={{
          fontSize: '22px',
          fontWeight: 700,
          color: backlogs === 0 ? '#22c55e' : backlogs <= 2 ? '#f59e0b' : '#ef4444',
          letterSpacing: '-0.5px',
        }}>{backlogs}</span>
      ),
      badge: (
        <span className={`sd-badge ${backlogs === 0 ? 'sd-badge--green' : backlogs <= 2 ? 'sd-badge--amber' : 'sd-badge--red'}`}>
          {backlogs === 0 ? 'Clear' : 'Active arrears'}
        </span>
      ),
    },
    {
      icon: <BookOpen style={{ width: 14, height: 14, color: '#818cf8' }} />,
      label: 'Department',
      value: <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{profile?.department || <span style={{ color: '#475569', fontStyle: 'italic', fontWeight: 400 }}>Not specified</span>}</span>,
    },
    {
      icon: <Calendar style={{ width: 14, height: 14, color: '#38bdf8' }} />,
      label: 'Batch / Year',
      value: <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{profile?.batch || <span style={{ color: '#475569', fontStyle: 'italic', fontWeight: 400 }}>Not specified</span>}</span>,
    },
    {
      icon: <Phone style={{ width: 14, height: 14, color: '#34d399' }} />,
      label: 'Phone',
      value: <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', fontFamily: 'monospace' }}>{profile?.phone || <span style={{ color: '#475569', fontStyle: 'italic', fontWeight: 400, fontFamily: 'inherit' }}>Not specified</span>}</span>,
    },
  ];

  return (
    <div className="sd-section">
      <div className="sd-section__header">
        <div>
          <h2 className="sd-section__title">Academic Details</h2>
          <p className="sd-section__sub">Verified placement eligibility credentials</p>
        </div>
        <button onClick={onEdit} type="button" className="sd-btn sd-btn--ghost">
          <Edit3 style={{ width: 14, height: 14 }} />
          Edit Details
        </button>
      </div>

      <div className="sd-stats-grid">
        {fields.map((f) => (
          <div key={f.label} className="sd-stat-cell">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              {f.icon}
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</span>
            </div>
            <div style={{ marginBottom: '4px' }}>{f.value}</div>
            {f.badge && <div style={{ marginTop: '4px' }}>{f.badge}</div>}
          </div>
        ))}
      </div>

      {profile?.bio && (
        <div style={{
          marginTop: '16px',
          padding: '12px 14px',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <UserCheck style={{ width: 14, height: 14, color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{profile.bio}</p>
        </div>
      )}
    </div>
  );
};

export default AcademicStatsCard;
