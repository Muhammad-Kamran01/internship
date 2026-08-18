import React from 'react';
import { Project } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { FolderKanban, Clock, CheckCircle2, DollarSign, Sparkles, CoinsIcon } from 'lucide-react';

interface StatsOverviewProps {
  projects: Project[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ projects }) => {
  const total = projects.length;
  const inProgress = projects.filter((p) => ['Analyzing', 'Assigned', 'In Progress'].includes(p.status)).length;
  const inReview = projects.filter((p) => p.status === 'Review').length;
  const completed = projects.filter((p) => p.status === 'Completed').length;
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  const stats = [
    {
      label: 'Total Projects',
      value: total,
      subtext: 'Submitted tasks',
      icon: <FolderKanban className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50/80 border-blue-100',
    },
    {
      label: 'Active & In Progress',
      value: inProgress,
      subtext: 'Processing or In Progress',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/80 border-amber-100',
    },
    {
      label: 'In Review',
      value: inReview,
      subtext: 'Quality audit',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50/80 border-purple-100',
    },
    {
      label: 'Completed Tasks',
      value: completed,
      subtext: 'Deliverables ready',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/80 border-emerald-100',
    },
    {
      label: 'Total Spend Amount',
      value: formatCurrency(totalBudget),
      subtext: 'Your investment',
      icon: <CoinsIcon className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50/80 border-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {stats.map((item, i) => (
        <div
          key={i}
          className={`p-4 rounded-2xl border ${item.bg} backdrop-blur-xs shadow-2xs transition-all hover:-translate-y-0.5`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 truncate">{item.label}</span>
            <div className="p-2 rounded-xl bg-white/80 shadow-2xs shrink-0">{item.icon}</div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{item.value}</p>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">{item.subtext}</p>
        </div>
      ))}
    </div>
  );
};