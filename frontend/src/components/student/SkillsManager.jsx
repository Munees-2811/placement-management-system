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
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    await onUpdateSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#E4E8EF]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[#202B3C]">Technical Skills</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#667085] border border-[#E2E8F0]">
              {skills.length} added
            </span>
          </div>
          <p className="text-xs text-[#667085]">Add programming languages, frameworks, and tools that match job requirements</p>
        </div>
      </div>

      {/* Input row */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill (e.g., React, Python) and press Enter..."
          className="flex-1 px-3 py-2 bg-white border border-[#E4E8EF] rounded-lg text-xs text-[#202B3C] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <button
          onClick={() => handleAddSkill()}
          disabled={saving || !newSkill.trim()}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Plus size={14} strokeWidth={1.8} />
          <span>Add Skill</span>
        </button>
      </div>
      {error && <p className="text-xs text-[#D14343] mb-2">{error}</p>}

      {/* Current skills */}
      <div className="min-h-[48px] p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E8EF] mb-4">
        {skills.length === 0 ? (
          <p className="text-xs text-[#94A3B8] text-center py-2 italic">
            No technical skills added yet
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EFF6FF] text-[#19365C] border border-[#BFDBFE] text-xs font-semibold shadow-2xs"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 rounded text-[#667085] hover:text-[#D14343] hover:bg-white/60 transition-colors cursor-pointer"
                  title="Remove skill"
                >
                  <X size={12} strokeWidth={1.8} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggested skills */}
      <div>
        <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-2">
          Suggested Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.map((suggested) => {
            const alreadyHas = skills.some((s) => s.toLowerCase() === suggested.toLowerCase());
            return (
              <button
                key={suggested}
                type="button"
                onClick={() => !alreadyHas && handleAddSkill(suggested)}
                disabled={alreadyHas || saving}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  alreadyHas
                    ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] cursor-default'
                    : 'bg-white border-[#E4E8EF] text-[#202B3C] hover:border-[#3569A8] hover:text-[#19365C] hover:bg-[#F8FAFC] cursor-pointer'
                }`}
              >
                {alreadyHas ? (
                  <Check size={11} strokeWidth={2} className="text-[#16845B]" />
                ) : (
                  <Plus size={11} strokeWidth={1.8} />
                )}
                <span>{suggested}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillsManager;
