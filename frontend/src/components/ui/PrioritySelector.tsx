import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, MoreHorizontal, ChevronDown } from 'lucide-react';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

interface PrioritySelectorProps {
  value?: Priority;
  onChange?: (priority: Priority) => void;
  disabled?: boolean;
  className?: string;
}

const PRIORITIES = [
  { value: 'P1' as Priority, label: 'Critical', color: 'text-red-500', icon: AlertCircle },
  { value: 'P2' as Priority, label: 'High', color: 'text-orange-500', icon: AlertTriangle },
  { value: 'P3' as Priority, label: 'Medium', color: 'text-yellow-500', icon: Info },
  { value: 'P4' as Priority, label: 'Low', color: 'text-gray-500', icon: MoreHorizontal },
];

export function PrioritySelector({ value = 'P4', onChange, disabled = false, className = '' }: PrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPriority = PRIORITIES.find((p) => p.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
        } bg-white dark:bg-gray-900 border-surface-300 dark:border-gray-700`}
      >
        {selectedPriority && <selectedPriority.icon className={`w-4 h-4 ${selectedPriority.color}`} />}
        <span className={`font-medium text-sm ${selectedPriority?.color}`}>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <ul className="absolute z-50 w-full mt-1 py-1 rounded-lg border bg-white dark:bg-gray-900 border-surface-300 dark:border-gray-700 shadow-lg">
            {PRIORITIES.map((priority) => {
              const Icon = priority.icon;
              return (
                <li key={priority.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange?.(priority.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      priority.value === value ? 'bg-surface-100 dark:bg-gray-800' : ''
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${priority.color}`} />
                    <span className={`flex-1 text-left text-sm ${priority.color}`}>{priority.value}</span>
                    <span className="text-xs text-surface-500">{priority.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
