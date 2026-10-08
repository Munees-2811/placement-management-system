import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const ProfileCompletionCard = ({ profile, onActionClick }) => {
  const percentage = profile?.completionPercentage || 0;
  const breakdown = profile?.completionBreakdown || {};

  const checklist = [
    { key: 'phone', label: 'Phone Number', weight: 10, done: breakdown.phone, action: 'academic' },
    { key: 'department', label: 'Department', weight: 10, done: breakdown.department, action: 'academic' },
    { key: 'batch', label: 'Batch / Year', weight: 10, done: breakdown.batch, action: 'academic' },
    { key: 'cgpa', label: 'CGPA', weight: 15, done: breakdown.cgpa, action: 'academic' },
    { key: 'skills', label: 'Technical Skills', weight: 15, done: breakdown.skills, action: 'skills' },
    { key: 'projects', label: 'Projects', weight: 20, done: breakdown.projects, action: 'projects' },
    { key: 'certifications', label: 'Certifications', weight: 10, done: breakdown.certifications, action: 'certifications' },
    { key: 'resume', label: 'Resume', weight: 10, done: breakdown.resume, action: 'resume' },
  ];

  const doneCount = checklist.filter((i) => i.done).length;

  const getBarColor = (pct) => {
    if (pct >= 85) return '#22c55e';
    if (pct >= 50) return '#6366f1';
    return '#f59e0b';
  };

  const getStatusLabel = (pct) => {
    if (pct === 100) return { text: 'Ready for Placement', cls: 'sd-badge--green' };
    if (pct >= 70) return { text: 'Good Standing', cls: 'sd-badge--blue' };
    return { text: 'Incomplete', cls: 'sd-badge--amber' };
  };

  const status = getStatusLabel(percentage);

  return (
    <div className="sd-section">
      <div className="sd-section__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <h2 className="sd-section__title">Profile Completion</h2>
            <span className={`sd-badge ${status.cls}`}>{status.text}</span>
          </div>
          <p className="sd-section__sub">
            {doneCount} of {checklist.length} sections complete · Complete your profile to improve shortlisting chances.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {percentage}
          </span>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', background: '#1e293b', borderRadius: '99px', overflow: 'hidden', margin: '16px 0' }}>
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: getBarColor(percentage),
            borderRadius: '99px',
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      {/* Checklist */}
      <div className="sd-completion-grid">
        {checklist.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onActionClick && onActionClick(item.action)}
            className={`sd-completion-item ${item.done ? 'sd-completion-item--done' : ''}`}
          >
            {item.done ? (
              <CheckCircle2 style={{ width: 15, height: 15, color: '#22c55e', flexShrink: 0 }} />
            ) : (
              <Circle style={{ width: 15, height: 15, color: '#475569', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: '13px', fontWeight: 500, flex: 1, textAlign: 'left' }}>{item.label}</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>+{item.weight}%</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
