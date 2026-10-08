import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript',
  'Python', 'Java', 'C++', 'SQL', 'TailwindCSS', 'Git', 'Docker', 'AWS',
  'REST APIs', 'Data Structures',
];

const SkillsManager = ({ skills = [], onUpdateSkills, saving = false }) => {
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');

  const handleAddSkill = async (skillToAdd) => {
    const trimmed = (skillToAdd || newSkill).trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError('Skill already added');
      setTimeout(() => setError(''), 2500);
      return;
    }
    setNewSkill('');
    setError('');
    await onUpdateSkills([...skills, trimmed]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    await onUpdateSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="sd-section">
      <div className="sd-section__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <h2 className="sd-section__title">Technical Skills</h2>
            <span className="sd-badge sd-badge--neutral">{skills.length} added</span>
          </div>
          <p className="sd-section__sub">Add languages, frameworks, and tools that match job requirements</p>
        </div>
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter…"
          className="sd-input"
          style={{ flex: 1 }}
        />
        <button
          onClick={() => handleAddSkill()}
          disabled={saving || !newSkill.trim()}
          type="button"
          className="sd-btn sd-btn--primary"
        >
          <Plus style={{ width: 14, height: 14 }} />
          Add
        </button>
      </div>
      {error && <p style={{ fontSize: '12px', color: '#f87171', marginBottom: '8px' }}>{error}</p>}

      {/* Current skills */}
      <div style={{
        minHeight: '44px',
        padding: '10px',
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        marginBottom: '16px',
      }}>
        {skills.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center', padding: '4px 0', fontStyle: 'italic' }}>
            No skills added yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.map((skill) => (
              <span key={skill} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px 3px 10px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#cbd5e1',
              }}>
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748b', padding: '1px', borderRadius: '3px',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = '#f87171'}
                  onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div>
        <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Quick add
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {SUGGESTED_SKILLS.map((suggested) => {
            const alreadyHas = skills.some((s) => s.toLowerCase() === suggested.toLowerCase());
            return (
              <button
                key={suggested}
                type="button"
                onClick={() => !alreadyHas && handleAddSkill(suggested)}
                disabled={alreadyHas || saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 9px',
                  background: alreadyHas ? '#0f172a' : '#1e293b',
                  border: `1px solid ${alreadyHas ? '#1e293b' : '#334155'}`,
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: alreadyHas ? '#334155' : '#94a3b8',
                  cursor: alreadyHas ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => { if (!alreadyHas) e.currentTarget.style.color = '#e2e8f0'; }}
                onMouseOut={e => { if (!alreadyHas) e.currentTarget.style.color = '#94a3b8'; }}
              >
                {alreadyHas ? <Check style={{ width: 10, height: 10, color: '#22c55e' }} /> : <Plus style={{ width: 10, height: 10 }} />}
                {suggested}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillsManager;
