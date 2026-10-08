import React from 'react';
import { Plus, GitBranch, ExternalLink, Edit2, Trash2 } from 'lucide-react';

const ProjectsSection = ({ projects = [], onAddProject, onEditProject, onDeleteProject }) => {
  return (
    <div className="sd-section">
      <div className="sd-section__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <h2 className="sd-section__title">Projects</h2>
            <span className="sd-badge sd-badge--neutral">{projects.length}</span>
          </div>
          <p className="sd-section__sub">Showcase your hands-on development work</p>
        </div>
        <button onClick={onAddProject} type="button" className="sd-btn sd-btn--primary">
          <Plus style={{ width: 14, height: 14 }} />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="sd-empty-state">
          <p className="sd-empty-state__title">No projects added yet</p>
          <p className="sd-empty-state__body">
            Showcase academic or personal projects to stand out to recruiters.
          </p>
          <button onClick={onAddProject} type="button" className="sd-btn sd-btn--ghost" style={{ marginTop: '12px' }}>
            <Plus style={{ width: 14, height: 14 }} />
            Add your first project
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
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Project</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</span>
          </div>
          {projects.map((project, idx) => (
            <div
              key={project._id}
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderTop: 'none',
                borderRadius: idx === projects.length - 1 ? '0 0 8px 8px' : '0',
                padding: '14px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{project.title}</span>
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b', textDecoration: 'none' }}
                        onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
                        onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                        <GitBranch style={{ width: 11, height: 11 }} />
                        Source
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#818cf8', textDecoration: 'none' }}
                        onMouseOver={e => e.currentTarget.style.color = '#a5b4fc'}
                        onMouseOut={e => e.currentTarget.style.color = '#818cf8'}>
                        <ExternalLink style={{ width: 11, height: 11 }} />
                        Live
                      </a>
                    )}
                  </div>

                  {project.description && (
                    <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                  )}

                  {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {project.techStack.map((tech, i) => (
                        <span key={i} style={{
                          padding: '1px 7px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                        }}>{tech}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  <button onClick={() => onEditProject(project)} title="Edit"
                    style={{ padding: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', borderRadius: '5px', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = '#1e293b'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'none'; }}>
                    <Edit2 style={{ width: 14, height: 14 }} />
                  </button>
                  <button onClick={() => onDeleteProject(project._id)} title="Delete"
                    style={{ padding: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', borderRadius: '5px', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = '#1e293b'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'none'; }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
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
