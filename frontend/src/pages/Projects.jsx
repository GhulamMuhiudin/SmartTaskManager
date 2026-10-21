// ============================================
// Projects Page — Project Management with Stats & CRUD
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api';

const COLOR_PALETTES = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setEditingProject(null);
    setForm({ name: '', description: '', color: '#6366f1' });
    setShowModal(true);
  };

  const openEdit = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      color: project.color || '#6366f1',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, form);
        showToast('Project updated successfully!');
      } else {
        await projectsAPI.create(form);
        showToast('Project created successfully!');
      }
      setShowModal(false);
      loadProjects();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save project.', 'error');
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete project "${name}"? Associated tasks will remain unassigned.`)) {
      return;
    }
    try {
      await projectsAPI.delete(id);
      showToast('Project deleted successfully.');
      loadProjects();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete project.', 'error');
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalTasksAcrossProjects = projects.reduce((acc, p) => acc + (p.task_count || 0), 0);
  const totalCompletedAcrossProjects = projects.reduce((acc, p) => acc + (p.completed_count || 0), 0);
  const overallCompletion = totalTasksAcrossProjects > 0
    ? Math.round((totalCompletedAcrossProjects / totalTasksAcrossProjects) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Projects</h1>
          <p className="text-surface-400 mt-1">Organize your tasks and track milestone goals</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-surface-400 font-semibold">Total Projects</p>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">📁</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{projects.length}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-surface-400 font-semibold">Total Tasks</p>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">⚡</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{totalTasksAcrossProjects}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-surface-400 font-semibold">Avg Progress</p>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">📈</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-emerald-400">{overallCompletion}%</p>
            <span className="text-xs text-surface-500">completed</span>
          </div>
        </div>
      </div>

      {/* Search & Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-9 !py-2 text-sm w-full"
          />
        </div>
        <p className="text-xs text-surface-400">
          Showing {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-surface-200 mb-2">No projects found</h3>
          <p className="text-surface-400 max-w-sm mx-auto mb-6 text-sm">
            {search ? 'No projects match your search criteria.' : 'Create your first project to organize tasks efficiently.'}
          </p>
          <button onClick={openCreate} className="btn-primary">
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const taskCount = project.task_count || 0;
            const completedCount = project.completed_count || 0;
            const inProgressCount = project.in_progress_count || 0;
            const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

            return (
              <div
                key={project.id}
                onClick={() => navigate('/tasks')}
                className="glass-card p-6 flex flex-col justify-between hover:border-surface-600/80 transition-all duration-300 hover:shadow-xl hover:shadow-surface-950/60 cursor-pointer group animate-fade-in relative overflow-hidden"
              >
                {/* Decorative top accent colored strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                        style={{ backgroundColor: `${project.color || '#6366f1'}33`, color: project.color || '#6366f1' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-surface-500">
                          Created {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEdit(project, e)}
                        className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                        title="Edit Project"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, project.name, e)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors"
                        title="Delete Project"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-surface-300 line-clamp-2 min-h-[40px] mb-4">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-surface-700/40">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-surface-400">Task Completion</span>
                    <span className="font-semibold text-white">{progress}% ({completedCount}/{taskCount})</span>
                  </div>

                  <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: project.color || '#6366f1',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {inProgressCount} in progress
                    </span>
                    <span className="text-indigo-400 group-hover:underline flex items-center gap-1 font-medium">
                      View tasks &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md glass-card p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-surface-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the goals and scope..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Accent Color</label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {COLOR_PALETTES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        form.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0"
                    title="Custom color"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'border-red-500/30' : 'border-emerald-500/30'}`}>
          <p className={`text-sm font-medium ${toast.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}

export default Projects;
