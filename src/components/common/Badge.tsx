import React from 'react';
import { ProjectStatus, ProjectPriority, UserRole } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'priority' | 'role' | 'default';
  status?: ProjectStatus;
  priority?: ProjectPriority;
  role?: UserRole;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  role,
  className = '',
}) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'status' && status) {
    switch (status) {
      case 'Submitted':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200/80';
        break;
      case 'Analyzing':
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200/80';
        break;
      case 'Assigned':
        colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
        break;
      case 'In Progress':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/80';
        break;
      case 'Review':
        colorClasses = 'bg-sky-50 text-sky-800 border-sky-200/80';
        break;
      case 'Completed':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
        break;
      case 'Rejected':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
        break;
    }
  } else if (variant === 'priority' && priority) {
    switch (priority) {
      case 'Low':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
      case 'Medium':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'High':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Urgent':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
        break;
    }
  } else if (variant === 'role' && role) {
    switch (role) {
      case 'student':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'freelancer':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'admin':
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
    }
  }

  const labelText = children || status || priority || role || '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {labelText}
    </span>
  );
};
