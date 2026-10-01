import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { Badge } from '../common/Badge';
import { formatDate, formatCurrency, getDaysRemaining } from '../../utils/formatters';
import { Calendar, Bot, ArrowRight, FileText } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { days, isOverdue } = getDaysRemaining(project.deadline);

  return (
    <div className="bg-slate-900 rounded-2xl border border-blue-500/30 p-5 shadow-lg shadow-slate-950/10 hover:shadow-xl hover:border-blue-400/70 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="status" status={project.status} />
          <Badge variant="priority" priority={project.priority} />
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`}>
          <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 mb-1.5">
            {project.title}
          </h3>
        </Link>

        {/* Category */}
        <p className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
          {project.category}
        </p>

        {/* Description snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
            <span>Assistant Progress</span>
            <span className="text-blue-600 font-bold">{project.progress_percentage || 0}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${project.progress_percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-700/70 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate font-medium text-slate-200">
              {project.assigned_agent || 'Assigning Assistant...'}
            </span>
          </div>
          <span className="font-bold text-white">{formatCurrency(project.budget)}</span>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due {formatDate(project.deadline)}</span>
            {isOverdue ? (
              <span className="text-rose-600 font-bold ml-1">(Overdue)</span>
            ) : (
              <span className="text-slate-500 font-medium ml-1">({days} days left)</span>
            )}
          </div>

          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
