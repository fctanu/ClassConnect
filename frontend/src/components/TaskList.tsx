import React from 'react';
import TaskItem from './TaskItem';
import { CheckSquare, Sparkles, Filter } from 'lucide-react';

interface TaskListProps {
  tasks: Array<{
    _id: string;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
    priority: 'P1' | 'P2' | 'P3' | 'P4';
    category?: string;
  }>;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 animate-in">
        <div className="w-20 h-20 bg-surface-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-10 h-10 text-surface-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">No tasks yet</h3>
        <p className="text-surface-500 dark:text-gray-400 max-w-sm mx-auto">
          Start by adding your first task above. Stay organized and boost your productivity!
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-400 rounded-full text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Tip: Press Enter to quickly add tasks</span>
        </div>
      </div>
    );
  }

  const p1Count = tasks.filter((t) => t.priority === 'P1' && !t.completed).length;
  const p2Count = tasks.filter((t) => t.priority === 'P2' && !t.completed).length;
  const p3Count = tasks.filter((t) => t.priority === 'P3' && !t.completed).length;
  const p4Count = tasks.filter((t) => t.priority === 'P4' && !t.completed).length;

  return (
    <div className="space-y-3">
      {/* Priority Stats */}
      {tasks.some((t) => !t.completed) && (
        <div className="flex items-center gap-4 mb-4 text-sm text-surface-600 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span>Active tasks: P1 ({p1Count}), P2 ({p2Count}), P3 ({p3Count}), P4 ({p4Count})</span>
        </div>
      )}

      {/* Task Items */}
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div key={task._id} className="animate-in" style={{ animationDelay: `${index * 50}ms` }}>
            <TaskItem task={task} onToggle={onToggle} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}
