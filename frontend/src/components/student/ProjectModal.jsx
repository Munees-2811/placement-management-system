import React, { useState, useEffect } from 'react';
import { X, Save, FolderGit2, Globe, GitBranch, Code2, Loader2 } from 'lucide-react';

const ProjectModal = ({ project, isOpen, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!project?._id;

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setForm({
          title: project.title || '',
          description: project.description || '',
          techStack: Array.isArray(project.techStack)
            ? project.techStack.join(', ')
            : project.techStack || '',
          githubUrl: project.githubUrl || '',
          liveUrl: project.liveUrl || '',
        });
      } else {
        setForm({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '' });
      }
      setErrors({});
    }
  }, [project, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Project title is required';
    if (form.description.length > 1000)
      errs.description = 'Description cannot exceed 1000 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      techStack: form.techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      githubUrl: form.githubUrl.trim(),
      liveUrl: form.liveUrl.trim(),
    };
    onSave(payload, project?._id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Edit Project' : 'Add New Project'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Update project details' : 'Showcase your work to recruiters'}
              </p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="proj-title" className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Project Title *
            </label>
            <input
              id="proj-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. AI Placement Portal, E-Commerce App..."
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.title ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="proj-desc" className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <span>Description</span>
              <span className="text-slate-500 font-normal">{form.description.length}/1000</span>
            </label>
            <textarea
              id="proj-desc"
              name="description"
              rows={3}
              maxLength={1000}
              value={form.description}
              onChange={handleChange}
              placeholder="Briefly describe the purpose, features, and impact of this project..."
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${
                errors.description ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.description && <p className="text-rose-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Tech Stack */}
          <div>
            <label htmlFor="proj-tech" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              Tech Stack <span className="text-slate-500 font-normal">(comma-separated)</span>
            </label>
            <input
              id="proj-tech"
              name="techStack"
              type="text"
              value={form.techStack}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, TailwindCSS"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* GitHub & Live URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-github" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                GitHub URL
              </label>
              <input
                id="proj-github"
                name="githubUrl"
                type="url"
                value={form.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="proj-live" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Live Demo URL
              </label>
              <input
                id="proj-live"
                name="liveUrl"
                type="url"
                value={form.liveUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : isEditing ? 'Update Project' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
