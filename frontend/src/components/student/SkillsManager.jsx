import React, { useState } from 'react';
import { Cpu, Plus, X, Sparkles, Check } from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React',
  'Node.js',
  'Express.js',
  'MongoDB',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'SQL',
  'TailwindCSS',
  'Git',
  'Docker',
  'AWS',
  'REST APIs',
  'Data Structures',
];

const SkillsManager = ({ skills = [], onUpdateSkills, saving = false }) => {
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');

  const handleAddSkill = async (skillToAdd) => {
    const trimmed = (skillToAdd || newSkill).trim();
    if (!trimmed) return;

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError('Skill already exists in your list');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const updated = [...skills, trimmed];
    setNewSkill('');
    setError('');
    await onUpdateSkills(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    await onUpdateSkills(updated);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Technical Skills</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30">
                {skills.length} Added
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Highlight your technical competencies to match with campus placement job roles.
            </p>
          </div>
        </div>
      </div>

      {/* Input Field */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill (e.g. React, Python, Docker) & press Enter..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => handleAddSkill()}
            disabled={saving || !newSkill.trim()}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
      </div>

      {/* Current Skills Badge List */}
      <div className="min-h-[48px] p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-5">
        {skills.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2 italic">
            No skills added yet. Add your key languages, frameworks, and tools above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-800 text-indigo-200 border border-indigo-500/20 shadow-sm transition-all"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  title={`Remove ${skill}`}
                  className="p-0.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Quick-Add Skills */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Suggestions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_SKILLS.map((suggested) => {
            const alreadyHas = skills.some(
              (s) => s.toLowerCase() === suggested.toLowerCase()
            );
            return (
              <button
                key={suggested}
                type="button"
                onClick={() => !alreadyHas && handleAddSkill(suggested)}
                disabled={alreadyHas || saving}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  alreadyHas
                    ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-default'
                    : 'bg-slate-950 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-800/80 hover:border-indigo-700/50'
                }`}
              >
                {alreadyHas ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3" />}
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
