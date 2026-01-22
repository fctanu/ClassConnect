import React, { useState } from 'react';
import { Button, PrioritySelector, DatePicker } from './ui';
import { Plus, Sparkles, Folder } from 'lucide-react';

type Project = {
  _id: string;
  name: string;
  color: string;
};

type Priority = 'P1' | 'P2' | 'P3' | 'P4';

interface TaskFormProps {
  onAdd: (title: string, priority: Priority, dueDate?: Date, category?: string) => Promise<void>;
  projects?: Project[];
  activeProjectId?: string;
}

export default function TaskForm({ onAdd, projects = [], activeProjectId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('P4');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [focused, setFocused] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd(title.trim(), priority, dueDate || undefined);
    setTitle('');
    setPriority('P4');
    setDueDate(null);
  }

  const selectedProject = projects.find((p) => p._id === activeProjectId);

  return (
    <div className="space-y-4">
      {/* Main Task Input */}
      <form onSubmit={submit}>
        <div
          className={`flex gap-2 p-2 rounded-xl border-2 transition-all duration-300 ${
            focused ? 'border-primary-500 bg-white dark:bg-gray-900 shadow-lg' : 'border-transparent bg-white dark:bg-gray-800 shadow-soft'
          }`}
        >
          <div className="flex-1 relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Add a new task..."
              className="w-full px-4 py-3 bg-transparent text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none"
            />
          </div>
          <Button type="submit" disabled={!title.trim()} className="shrink-0">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </form>

      {/* Expandable Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-sm text-surface-600 dark:text-gray-400 hover:text-surface-900 dark:hover:text-white transition-colors"
        >
          <Sparkles className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
          <span>{showOptions ? 'Hide options' : 'Show options'}</span>
        </button>

        {showOptions && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in">
            {/* Priority Selector */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Priority</label>
              <PrioritySelector value={priority} onChange={setPriority} />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Due Date</label>
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>

            {/* Project Selector */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Project</label>
              <button
                type="button"
                onClick={() => {
                  // For now, just show alert - would integrate full project selector here
                  if (selectedProject) {
                    alert(`Selected: ${selectedProject.name}`);
                  } else {
                    alert('No project selected (All Tasks)');
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 border-surface-300 dark:border-gray-700 text-surface-900 dark:text-white text-sm hover:bg-surface-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Folder className="w-4 h-4 text-surface-400" />
                <span className="flex-1 text-left truncate">
                  {selectedProject ? selectedProject.name : 'All Tasks'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
