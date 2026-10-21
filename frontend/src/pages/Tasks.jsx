// ============================================
// Tasks Page — List/Kanban views with CRUD
// ============================================
import { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI } from '../api';
import TaskCard from '../components/TaskCard';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'kanban'
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '', priority: '', project_id: '', search: '', sort: 'created_at', order: 'desc',
  });
  const [toast, setToast] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium', due_date: '', project_id: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [tasksRes, projectsRes] = await Promise.all([
        tasksAPI.getAll(cleanFilters),
        projectsAPI.getAll(),
      ]);
      setTasks(tasksRes.data.data);
      setProjects(projectsRes.data.data);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', project_id: '' });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      project_id: task.project_id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        project_id: form.project_id ? parseInt(form.project_id) : null,
        due_date: form.due_date || null,
      };

      if (editingTask) {
        await tasksAPI.update(editingTask.id, payload);
        showToast('Task updated successfully!');
      } else {
        await tasksAPI.create(payload);
        showToast('Task created successfully!');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save task.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      showToast('Task deleted.');
      loadData();
    } catch (err) {
      showToast('Failed to delete task.', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await tasksAPI.update(id, { status });
      showToast(status === 'completed' ? 'Task completed! 🎉' : 'Status updated.');
      loadData();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  // Kanban drag & drop
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) handleStatusChange(parseInt(taskId), newStatus);
    e.currentTarget.classList.remove('kanban-drop-active');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('kanban-drop-active');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('kanban-drop-active');
  };

  // Group tasks by status for kanban
  const kanbanColumns = [
    { key: 'todo', label: 'To Do', color: 'blue', icon: '○' },
    { key: 'in_progress', label: 'In Progress', color: 'amber', icon: '◐' },
    { key: 'completed', label: 'Completed', color: 'emerald', icon: '●' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Tasks</h1>
          <p className="text-surface-400 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-surface-800/80 rounded-xl p-1 border border-surface-700/50">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-surface-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === 'kanban' ? 'bg-indigo-600 text-white shadow-lg' : 'text-surface-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="input-field max-w-xs !py-2 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="select-field max-w-[150px] !py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="select-field max-w-[150px] !py-2 text-sm"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filters.project_id}
          onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
          className="select-field max-w-[180px] !py-2 text-sm"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={`${filters.sort}-${filters.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split('-');
            setFilters({ ...filters, sort, order });
          }}
          className="select-field max-w-[180px] !py-2 text-sm"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="due_date-asc">Due Date ↑</option>
          <option value="due_date-desc">Due Date ↓</option>
          <option value="priority-asc">Priority (High→Low)</option>
          <option value="title-asc">Title A→Z</option>
        </select>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-surface-300 mb-2">No tasks found</h3>
              <p className="text-surface-500 mb-6">Create your first task to get started!</p>
              <button onClick={openCreate} className="btn-primary">
                Create Task
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[60vh]">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="flex flex-col rounded-2xl bg-surface-800/30 border border-surface-700/30 transition-all duration-200"
                onDrop={(e) => handleDrop(e, col.key)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/30">
                  <div className="flex items-center gap-2">
                    <span className={`text-${col.color}-400`}>{col.icon}</span>
                    <h3 className="font-semibold text-surface-200">{col.label}</h3>
                    <span className="ml-1 px-2 py-0.5 bg-surface-700/50 rounded-full text-xs text-surface-400 font-medium">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column body */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[65vh]">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8 text-surface-500 text-sm">
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        draggable={true}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg glass-card p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-surface-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Add details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="select-field"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="select-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Project</label>
                  <select
                    value={form.project_id}
                    onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                    className="select-field"
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
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

export default Tasks;
