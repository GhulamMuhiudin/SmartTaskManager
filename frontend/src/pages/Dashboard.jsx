// ============================================
// Dashboard Page — Stats, Charts, Activity
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, upcomingRes, weeklyRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getUpcoming(),
        dashboardAPI.getWeekly(),
        dashboardAPI.getActivity(),
      ]);
      setStats(statsRes.data.data);
      setUpcoming(upcomingRes.data.data);
      setWeekly(weeklyRes.data.data);
      setActivity(activityRes.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date(new Date().toDateString());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (action) => {
    const icons = {
      created: '➕',
      completed: '✅',
      updated: '✏️',
      deleted: '🗑️',
      registered: '👤',
    };
    return icons[action] || '📝';
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-80 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  // Chart calculations
  const maxChartValue = Math.max(...weekly.map(d => Math.max(d.completed_count, d.created_count)), 1);

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.total_tasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
      bg: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      label: 'In Progress',
      value: stats?.in_progress_tasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
    {
      label: 'Completed',
      value: stats?.completed_tasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-green-500',
      shadow: 'shadow-emerald-500/20',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Overdue',
      value: stats?.overdue_tasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'from-red-500 to-rose-500',
      shadow: 'shadow-red-500/20',
      bg: 'bg-red-500/10',
      textColor: 'text-red-400',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-surface-400 mt-1">Here's what's happening with your tasks today</p>
        </div>
        <button onClick={() => navigate('/tasks')} className="btn-primary flex items-center gap-2 self-start">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <div className={card.textColor}>{card.icon}</div>
              </div>
              {card.label === 'Completed' && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  {stats?.completion_rate || 0}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-surface-400 mt-0.5">{card.label}</p>
            </div>
            {/* Progress bar for completion */}
            {card.label === 'Completed' && (
              <div className="mt-2 h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${stats?.completion_rate || 0}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Productivity Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Weekly Productivity</h2>
              <p className="text-sm text-surface-400 mt-0.5">Tasks completed vs created this week</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500/40" />
                Created
              </span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-48 px-2">
            {weekly.map((day, i) => {
              const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
              const completedHeight = maxChartValue > 0 ? (day.completed_count / maxChartValue) * 100 : 0;
              const createdHeight = maxChartValue > 0 ? (day.created_count / maxChartValue) * 100 : 0;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1 h-40">
                    <div
                      className="w-5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-500 ease-out hover:opacity-80 relative"
                      style={{ height: `${Math.max(completedHeight, 4)}%`, animationDelay: `${i * 100}ms` }}
                      title={`${day.completed_count} completed`}
                    >
                      {day.completed_count > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.completed_count}
                        </span>
                      )}
                    </div>
                    <div
                      className="w-5 bg-gradient-to-t from-purple-600/40 to-purple-400/40 rounded-t-md transition-all duration-500 ease-out hover:opacity-80"
                      style={{ height: `${Math.max(createdHeight, 4)}%`, animationDelay: `${i * 100 + 50}ms` }}
                      title={`${day.created_count} created`}
                    />
                  </div>
                  <span className="text-xs text-surface-500 mt-1">{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming Deadlines</h2>
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-surface-500 text-sm">No upcoming deadlines 🎉</p>
              </div>
            ) : (
              upcoming.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-700/30 transition-all cursor-pointer group">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-red-400' :
                    task.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-surface-500">{formatDate(task.due_date)}</span>
                      {task.project_name && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md" style={{
                          backgroundColor: `${task.project_color}15`,
                          color: task.project_color,
                        }}>
                          {task.project_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row — Activity + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-surface-500 text-sm text-center py-8">No recent activity</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-700/30 transition-all">
                  <span className="text-lg w-8 text-center">{getActivityIcon(item.action)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-300">
                      <span className="capitalize font-medium text-surface-200">{item.action}</span>
                      {' '}{item.entity_type}{' '}
                      <span className="font-medium text-surface-200">"{item.entity_title}"</span>
                    </p>
                  </div>
                  <span className="text-xs text-surface-500 flex-shrink-0">{getTimeAgo(item.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-700/20">
              <span className="text-sm text-surface-400">Projects</span>
              <span className="text-lg font-bold text-white">{stats?.total_projects || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-700/20">
              <span className="text-sm text-surface-400">High Priority</span>
              <span className="text-lg font-bold text-red-400">{stats?.high_priority_pending || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-700/20">
              <span className="text-sm text-surface-400">To Do</span>
              <span className="text-lg font-bold text-blue-400">{stats?.todo_tasks || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-700/20">
              <span className="text-sm text-surface-400">Completion Rate</span>
              <span className="text-lg font-bold text-emerald-400">{stats?.completion_rate || 0}%</span>
            </div>

            {/* Circular progress */}
            <div className="flex items-center justify-center pt-2">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#progressGradient)" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats?.completion_rate || 0) * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{stats?.completion_rate || 0}%</span>
                  <span className="text-[10px] text-surface-500 uppercase tracking-wider">done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
