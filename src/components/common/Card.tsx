import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 text-slate-100 rounded-2xl border border-slate-700/80 p-5 shadow-lg shadow-slate-950/10 transition-all duration-200 ${
        hoverable
          ? 'hover:border-blue-400 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
