import React from 'react';
import { ActivityLog } from '../../types';
import { Clock, CheckCircle2, Bot, FileUp, Sparkles } from 'lucide-react';

interface ActivityTimelineProps {
  logs: ActivityLog[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-400">
        No recent system activity recorded.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.slice(0, 5).map((log) => {
        let icon = <Clock className="w-4 h-4 text-blue-600" />;
        let iconBg = 'bg-blue-50 text-blue-600';

        if (log.activity.toLowerCase().includes('agent')) {
          icon = <Bot className="w-4 h-4 text-purple-600" />;
          iconBg = 'bg-purple-50 text-purple-600';
        } else if (log.activity.toLowerCase().includes('completed')) {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
          iconBg = 'bg-emerald-50 text-emerald-600';
        } else if (log.activity.toLowerCase().includes('file')) {
          icon = <FileUp className="w-4 h-4 text-amber-600" />;
          iconBg = 'bg-amber-50 text-amber-600';
        }

        return (
          <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900">{log.activity}</p>
              {log.details && <p className="text-xs text-slate-600 truncate mt-0.5">{log.details}</p>}
              <span className="text-[10px] text-slate-400 mt-1 block">
                {new Date(log.created_at).toLocaleDateString()} at{' '}
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
