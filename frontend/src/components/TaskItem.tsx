import React, { useState } from 'react';
import { Button } from './ui';
import { CheckCircle2, Circle, Trash2, GripVertical, Calendar, AlertCircle, AlertTriangle, Info, MoreHorizontal } from 'lucide-react';

interface TaskItemProps {
  task: {
    _id: string;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
    priority: 'P1' | 'P2' | 'P3' | 'P4';
    category?: string;
  };
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PRIORITY_CONFIG = {
  P1: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-200 dark:border-red-800' },
  P2: { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950', borderColor: 'border-orange-200 dark:border-orange-800' },
  P3: { icon: Info, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950', borderColor: 'border-yellow-200 dark:border-yellow-800' },
  P4: { icon: MoreHorizontal, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-950', borderColor: 'border-gray-200 dark:border-gray-800' },
};

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [deleting, setDeleting] = useState(false);
  const priorityConfig = PRIORITY_CONFIG[task.priority || 'P4'];
  const PriorityIcon = priorityConfig.icon;

  async function handleDelete() {
    setDeleting(true);
    await onDelete(task._id);
    setDeleting(false);
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <div
      className={`group flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:shadow-md animate-in ${
        task.completed
          ? 'bg-surface-50 dark:bg-gray-800 border-surface-200 dark:border-gray-700'
          : isOverdue
          ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
          : 'bg-white dark:bg-gray-900 border-surface-200 dark:border-gray-700'
      }`}
    >
      {/* Drag Handle */}
      <button className="text-surface-300 hover:text-surface-500 transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100">
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Priority Indicator */}
      <div className={`p-1.5 rounded-lg ${priorityConfig.bgColor} ${priorityConfig.borderColor} border`}>
        <PriorityIcon className={`w-4 h-4 ${priorityConfig.color}`} />
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task._id, !task.completed)}
        className={`shrink-0 transition-all duration-300 ${
          task.completed ? 'text-green-500 scale-110' : 'text-surface-300 hover:text-primary-500'
        }`}
      >
        {task.completed ? (
          <CheckCircle2 className="w-6 h-6" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <span
            className={`text-surface-900 dark:text-white transition-all duration-300 ${
              task.completed ? 'line-through text-surface-400 dark:text-gray-500' : ''
            }`}
          >
            {task.title}
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : isDueToday && !task.completed ? 'text-primary-600' : 'text-surface-400'}`} />
              <span className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueToday && !task.completed ? 'text-primary-700 dark:text-primary-400' : 'text-surface-500'}`}>
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              {isOverdue && <span className="text-xs font-medium text-red-600 dark:text-red-400">Overdue</span>}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <p className={`text-sm text-surface-500 dark:text-gray-400 mt-1 ${task.completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}

          {/* Category Badge */}
          {task.category && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-gray-700 text-surface-600 dark:text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.category === 'work' ? '#ef4444' : task.category === 'personal' ? '#3b82f6' : '#22c55e' }} />
              <span>{task.category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        loading={deleting}
        className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
