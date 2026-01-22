import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({ value, onChange, disabled = false, className = '' }: DatePickerProps) {
  const getRelativeDateLabel = (date: Date | undefined): string => {
    if (!date) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    
    const diffTime = inputDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleClear = () => {
    onChange?.(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="date"
          value={formatDateForInput(value)}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : null;
            if (date && !isNaN(date.getTime())) {
              onChange?.(date);
            } else if (!e.target.value) {
              onChange?.(null);
            }
          }}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-8 text-sm rounded-lg border bg-white dark:bg-gray-900 border-surface-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear date"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {value && (
        <div className="mt-1 text-xs text-surface-500">
          {getRelativeDateLabel(value)}
        </div>
      )}

      {!disabled && (
        <div className="flex gap-2 mt-2">
          {['Today', 'Tomorrow', 'Next Week'].map((label) => {
            let date: Date;
            const today = new Date();

            if (label === 'Today') {
              date = new Date(today);
            } else if (label === 'Tomorrow') {
              date = new Date(today);
              date.setDate(date.getDate() + 1);
            } else {
              date = new Date(today);
              date.setDate(date.getDate() + 7);
            }

            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange?.(date)}
                className="px-2 py-1 text-xs rounded-md bg-surface-100 dark:bg-gray-800 text-surface-700 dark:text-gray-300 hover:bg-surface-200 dark:hover:bg-gray-700 transition-colors"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
