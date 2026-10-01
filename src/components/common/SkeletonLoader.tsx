import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/80 p-5 shadow-lg animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-700 rounded-md w-1/3"></div>
        <div className="h-5 bg-slate-700 rounded-full w-20"></div>
      </div>
      <div className="h-6 bg-slate-700 rounded-md w-3/4 mb-3"></div>
      <div className="h-4 bg-slate-800 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-slate-800 rounded-md w-5/6 mb-4"></div>
      <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
        <div className="h-3 bg-slate-700 rounded-md w-24"></div>
        <div className="h-3 bg-slate-700 rounded-md w-16"></div>
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
