import React from 'react';
import { Plus, GitBranch, ExternalLink, Edit3, Trash2, FolderGit2 } from 'lucide-react';

const ProjectsSection = ({ projects = [], onAddProject, onEditProject, onDeleteProject }) => {
  return (
    <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#E4E8EF]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[#202B3C]">Projects</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#667085] border border-[#E2E8F0]">
              {projects.length}
            </span>
          </div>
          <p className="text-xs text-[#667085]">Showcase your hands-on development and technical work</p>
        </div>
        <button
          onClick={onAddProject}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={14} strokeWidth={1.8} />
          <span>Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFCFE]">
          <FolderGit2 className="w-10 h-10 text-[#94A3B8] mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-[#202B3C] mb-1">No projects added yet</p>
          <p className="text-xs text-[#667085] max-w-sm mx-auto mb-4 leading-relaxed">
            Showcase academic or personal projects to highlight your engineering capabilities to campus recruiters.
          </p>
          <button
            onClick={onAddProject}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.8} />
            <span>Add Your First Project</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="p-4 rounded-xl bg-white border border-[#E4E8EF] hover:border-[#CBD5E1] transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="text-sm font-bold text-[#202B3C]">{project.title}</h3>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#667085] hover:text-[#19365C] font-medium"
                      >
                        <GitBranch size={12} strokeWidth={1.8} />
                        <span>Source</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#3569A8] hover:text-[#19365C] font-medium"
                      >
                        <ExternalLink size={12} strokeWidth={1.8} />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-xs text-[#667085] leading-relaxed mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[11px] font-mono text-[#475569]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditProject(project)}
                    type="button"
                    className="p-1.5 rounded-lg text-[#3569A8] hover:text-[#19365C] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                    title="Edit project"
                  >
                    <Edit3 size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => onDeleteProject(project._id)}
                    type="button"
                    className="p-1.5 rounded-lg text-[#D14343] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
