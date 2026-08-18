import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 active:scale-[0.99]';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30';
      break;
    case 'secondary':
      variantClasses =
        'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60';
      break;
    case 'outline':
      variantClasses =
        'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs';
      break;
    case 'danger':
      variantClasses =
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-slate-600 hover:bg-slate-100/80';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1.5 text-xs gap-1.5';
      break;
    case 'md':
      sizeClasses = 'px-4 py-2 text-sm gap-2';
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3 text-base gap-2.5';
      break;
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
};
