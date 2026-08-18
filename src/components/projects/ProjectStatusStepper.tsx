import React from 'react';
import { ProjectStatus } from '../../types';
import { PROJECT_STATUS_STEPS } from '../../constants/statusSteps';
import { Send, Cpu, UserCheck, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ProjectStatusStepperProps {
  currentStatus: ProjectStatus;
}

export const ProjectStatusStepper: React.FC<ProjectStatusStepperProps> = ({ currentStatus }) => {
  const getStepIcon = (iconName: string, isCompleted: boolean, isCurrent: boolean) => {
    const size = 'w-4 h-4';
    if (iconName === 'Send') return <Send className={size} />;
    if (iconName === 'Cpu') return <Cpu className={size} />;
    if (iconName === 'UserCheck') return <UserCheck className={size} />;
    if (iconName === 'Clock') return <Clock className={size} />;
    if (iconName === 'ShieldCheck') return <ShieldCheck className={size} />;
    return <CheckCircle2 className={size} />;
  };

  const currentStepObj = PROJECT_STATUS_STEPS.find((s) => s.status === currentStatus) || PROJECT_STATUS_STEPS[0];
  const currentStepNum = currentStepObj.stepNumber;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Project Progress Tracker</h4>
          <p className="text-xs text-slate-500">Monitor live academic task status</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Step {currentStepNum} of {PROJECT_STATUS_STEPS.length}: {currentStatus}
        </span>
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden sm:grid grid-cols-6 gap-2 relative">
        {PROJECT_STATUS_STEPS.map((step) => {
          const isCompleted = step.stepNumber < currentStepNum;
          const isCurrent = step.stepNumber === currentStepNum;

          let circleBg = 'bg-slate-100 text-slate-400 border-slate-200';
          let textColor = 'text-slate-400';

          if (isCompleted) {
            circleBg = 'bg-emerald-600 text-white border-emerald-600';
            textColor = 'text-slate-700 font-semibold';
          } else if (isCurrent) {
            circleBg = 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 ring-4 ring-blue-100';
            textColor = 'text-blue-600 font-bold';
          }

          return (
            <div key={step.status} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${circleBg}`}
              >
                {getStepIcon(step.iconName, isCompleted, isCurrent)}
              </div>
              <span className={`text-xs mt-2 truncate w-full ${textColor}`}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="sm:hidden space-y-3">
        {PROJECT_STATUS_STEPS.map((step) => {
          const isCompleted = step.stepNumber < currentStepNum;
          const isCurrent = step.stepNumber === currentStepNum;

          let badgeStyle = 'bg-slate-100 text-slate-500 border-slate-200';
          if (isCompleted) badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          if (isCurrent) badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 font-bold';

          return (
            <div
              key={step.status}
              className={`flex items-center gap-3 p-2.5 rounded-xl border ${badgeStyle}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isCurrent ? 'bg-blue-600 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {getStepIcon(step.iconName, isCompleted, isCurrent)}
              </div>
              <div>
                <p className="text-xs font-semibold">{step.label}</p>
                <p className="text-[10px] text-slate-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
