import React, { useState } from 'react';
import { Plus, LayoutDashboard, MoreVertical, Trash2, Edit2, FolderOpen, Check } from 'lucide-react';

export interface Project {
  _id: string;
  name: string;
  color: string;
}

interface SidebarProps {
  projects: Project[];
  activeProjectId?: string;
  onProjectSelect?: (projectId: string) => void;
  onCreateProject?: (name: string, color: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onShowAllTasks?: () => void;
  showAll?: boolean;
}

const PROJECT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
];

export function Sidebar({
  projects,
  activeProjectId,
  onProjectSelect,
  onCreateProject,
  onDeleteProject,
  onShowAllTasks,
  showAll = false,
}: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[5]);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject?.(newProjectName.trim(), selectedColor);
      setNewProjectName('');
      setSelectedColor(PROJECT_COLORS[5]);
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 h-full flex flex-col bg-white dark:bg-gray-900 border-r border-surface-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-4 border-b border-surface-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-1.5 rounded-lg bg-surface-100 dark:bg-gray-800 text-surface-600 dark:text-gray-400 hover:bg-surface-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Add new project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <button
          onClick={onShowAllTasks}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            showAll
              ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
              : 'text-surface-700 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${showAll ? 'text-blue-600 dark:text-blue-400' : 'text-surface-400'}`} />
          <span className="flex-1 text-left">All Tasks</span>
        </button>

        {projects.length > 0 && (
          <p className="px-3 py-1 text-xs font-medium text-surface-500 dark:text-gray-400 uppercase tracking-wider">
            Projects
          </p>
        )}

        {projects.map((project) => (
          <div key={project._id} className="relative group">
            <button
              onClick={() => onProjectSelect?.(project._id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
                activeProjectId === project._id
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                  : 'text-surface-700 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-gray-800'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="flex-1 text-left truncate">{project.name}</span>
              {activeProjectId === project._id && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(showMenu === project._id ? null : project._id);
              }}
              className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-200 dark:hover:bg-gray-700 focus:outline-none ${
                showMenu === project._id ? 'opacity-100' : ''
              }`}
            >
              <MoreVertical className="w-4 h-4 text-surface-400" />
            </button>

            {showMenu === project._id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                <div className="absolute right-0 top-8 z-20 w-36 rounded-lg border shadow-lg bg-white dark:bg-gray-900 border-surface-200 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onDeleteProject?.(project._id);
                        setShowMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 focus:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {projects.length === 0 && !isCreating && (
          <div className="px-3 py-4 text-center">
            <FolderOpen className="w-8 h-8 mx-auto text-surface-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-surface-500 dark:text-gray-400">No projects yet</p>
            <p className="text-xs text-surface-400 dark:text-gray-500 mt-1">Create one to get started</p>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="px-4 py-3 border-t border-surface-200 dark:border-gray-700">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateProject();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewProjectName('');
              }
            }}
            placeholder="Project name"
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 border-surface-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-400 mb-3"
          />
          <div className="flex gap-2 mb-3">
            {PROJECT_COLORS.slice(0, 8).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewProjectName('');
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-surface-100 dark:bg-gray-800 text-surface-700 dark:text-gray-300 hover:bg-surface-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
