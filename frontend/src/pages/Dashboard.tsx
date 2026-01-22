import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useTheme } from '../context/ThemeProvider';
import api from '../services/api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent } from '../components/ui';
import { ClipboardList, CheckCircle2, Circle, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

type Task = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  category?: string;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  _id: string;
  name: string;
  color: string;
};

export default function Dashboard() {
  const { resolvedTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  async function load() {
    try {
      setLoading(true);
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/projects'),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load tasks', err);
      setError('Could not load your tasks. Please try again.');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function loadFilteredTasks() {
    try {
      setLoading(true);
      let url = '/api/tasks';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (activeProjectId) {
        params.append('category', activeProjectId);
      }

      const tasksRes = await api.get(`${url}?${params.toString()}`);
      setTasks(tasksRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load tasks', err);
      setError('Could not load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadFilteredTasks();
  }, [activeProjectId, searchQuery]);

  async function add(title: string, priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P4', dueDate?: Date | null, category?: string) {
    try {
      const res = await api.post('/api/tasks', {
        title,
        priority,
        ...(dueDate && { dueDate: dueDate.toISOString() }),
        ...(category && { category }),
      });
      setTasks((prev) => [res.data, ...prev]);
      toast.success('Task added successfully');
    } catch (err) {
      console.error('Add failed', err);
      toast.error('Failed to add task');
    }
  }

  async function toggle(id: string, completed: boolean) {
    try {
      const res = await api.put(`/api/tasks/${id}`, { completed });
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      if (!completed) {
        toast.success('Task marked as complete! 🎉');
      }
    } catch (err) {
      console.error('Toggle failed', err);
      toast.error('Failed to update task');
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete task');
    }
  }

  async function handleCreateProject(name: string, color: string) {
    try {
      const res = await api.post('/api/projects', { name, color });
      setProjects((prev) => [res.data, ...prev]);
      toast.success('Project created!');
    } catch (err) {
      console.error('Create project failed', err);
      toast.error('Failed to create project');
    }
  }

  async function handleDeleteProject(projectId: string) {
    try {
      await api.delete(`/api/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      if (activeProjectId === projectId) {
        setActiveProjectId(undefined);
        load();
      }
      toast.success('Project deleted');
    } catch (err) {
      console.error('Delete project failed', err);
      toast.error('Failed to delete project');
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getOverdueTasks = () => {
    return tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length;
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-600 dark:text-gray-300">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Your Tasks</h1>
          <p className="text-surface-500 dark:text-gray-400 text-sm">Manage and track your daily tasks</p>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-900 border-surface-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <Sidebar
            projects={projects}
            activeProjectId={activeProjectId}
            onProjectSelect={setActiveProjectId}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onShowAllTasks={() => {
              setActiveProjectId(undefined);
              load();
            }}
            showAll={activeProjectId === undefined}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Project Selector */}
          <div className="lg:hidden mb-4">
            <select
              value={activeProjectId || ''}
              onChange={(e) => {
                const value = e.target.value;
                setActiveProjectId(value || undefined);
                if (!value) load();
              }}
              className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-900 border-surface-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-white"
            >
              <option value="">All Tasks</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <ClipboardList className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 dark:text-gray-400">Total Tasks</p>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white">{tasks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white">{completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <Circle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white">{pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          {tasks.length > 0 && (
            <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-surface-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm text-surface-500 dark:text-gray-400">{progress}% complete</span>
                </div>
                <div className="h-2 bg-surface-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overdue Alert */}
          {getOverdueTasks() > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <span className="font-medium">{getOverdueTasks()} overdue task{getOverdueTasks() > 1 ? 's' : ''}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 mb-6">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task Form */}
          <TaskForm
            onAdd={(title, priority, dueDate, category) =>
              add(title, priority, dueDate, category)
            }
            projects={projects}
            activeProjectId={activeProjectId}
          />

          {/* Task List */}
          <TaskList tasks={tasks} onToggle={toggle} onDelete={remove} />
        </div>
      </div>
    </div>
  );
}
