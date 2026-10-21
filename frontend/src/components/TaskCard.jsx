// ============================================
// TaskCard — Reusable task card component
// ============================================

function TaskCard({ task, onEdit, onDelete, onStatusChange, draggable = false }) {
  const statusConfig = {
    todo: { label: 'To Do', class: 'badge-todo', icon: '○' },
    in_progress: { label: 'In Progress', class: 'badge-in-progress', icon: '◐' },
    completed: { label: 'Completed', class: 'badge-completed', icon: '●' },
  };

  const priorityConfig = {
    high: { label: 'High', class: 'priority-high' },
    medium: { label: 'Medium', class: 'priority-medium' },
    low: { label: 'Low', class: 'priority-low' },
  };

  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  // Check if overdue
  const isOverdue = task.due_date && task.status !== 'completed' &&
    new Date(task.due_date) < new Date(new Date().toDateString());

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date(new Date().toDateString());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id.toString());
    e.target.classList.add('task-dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('task-dragging');
  };

  return (
    <div
      className="glass-card p-4 hover:border-surface-600/80 transition-all duration-300 hover:shadow-lg hover:shadow-surface-900/50 group cursor-pointer animate-fade-in"
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Top row: Priority + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={priority.class}>{priority.label}</span>
          {task.project_name && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium border" style={{
              backgroundColor: `${task.project_color || '#6366f1'}15`,
              color: task.project_color || '#6366f1',
              borderColor: `${task.project_color || '#6366f1'}30`,
            }}>
              {task.project_name}
            </span>
          )}
        </div>
        <span className={status.class}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-surface-100 mb-1 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-surface-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Bottom row: Due date + Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-700/30">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-red-400' : 'text-surface-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isOverdue ? 'Overdue: ' : ''}{formatDate(task.due_date)}
            </span>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {task.status !== 'completed' && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'completed'); }}
              className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-surface-500 hover:text-emerald-400 transition-all"
              title="Mark complete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
            className="p-1.5 rounded-lg hover:bg-indigo-500/15 text-surface-500 hover:text-indigo-400 transition-all"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/15 text-surface-500 hover:text-red-400 transition-all"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
