import React from 'react';
import { FolderGit2, Plus, GitBranch, ExternalLink, Edit2, Trash2, Code2 } from 'lucide-react';

const ProjectsSection = ({ projects = [], onAddProject, onEditProject, onDeleteProject }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Projects</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                {projects.length} Showcased
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Demonstrate hands-on software development and problem-solving capability.
            </p>
          </div>
        </div>

        <button
          onClick={onAddProject}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
          <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300 mb-1">No Projects Added Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Showcase your best academic or personal projects to stand out to recruiters and tech leads.
          </p>
          <button
            onClick={onAddProject}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Your First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditProject(project)}
                      title="Edit Project"
                      className="p-1 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project._id)}
                      title="Delete Project"
                      className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Tech Stack */}
                {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-900 text-xs">
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Source Code</span>
                  </a>
                ) : (
                  <span className="text-slate-600 text-[11px] italic">No repo link</span>
                )}

                {project.liveUrl && (
                  <>
                    <span className="text-slate-700">•</span>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
