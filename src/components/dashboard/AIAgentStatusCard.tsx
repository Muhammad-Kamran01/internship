import React, { useState } from 'react';
import { Project } from '../../types';
import { projectService } from '../../services/supabase/projectService';
import { Bot, Sparkles, Play, CheckCircle2, Cpu } from 'lucide-react';
import { Button } from '../common/Button';

interface AIAgentStatusCardProps {
  project: Project;
  onProjectUpdated?: (updated: Project) => void;
}

export const AIAgentStatusCard: React.FC<AIAgentStatusCardProps> = ({
  project,
  onProjectUpdated,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateNextStep = () => {
    setIsSimulating(true);
    setTimeout(() => {
      projectService.simulateAIAgentProgress(project.id, (updated) => {
        setIsSimulating(false);
        if (onProjectUpdated) onProjectUpdated(updated);
      });
    }, 800);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                Active Assistant
              </span>
              <h4 className="text-sm font-bold text-white">
                {project.assigned_agent || 'Documentation Assistant'}
              </h4>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center gap-1">
            <Cpu className="w-3 h-3 animate-pulse text-blue-400" />
            <span>Assistant Status: {project.status}</span>
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          The assigned assistant is analyzing requirements, generating academic artifacts, and conducting automated plagiarism & quality checks.
        </p>

        {/* Live Step Progress */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Execution Phase
            </span>
            <span className="text-blue-400">{project.progress_percentage || 0}%</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-700"
              style={{ width: `${project.progress_percentage || 0}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 text-center">
            <span className={project.progress_percentage! >= 25 ? 'text-blue-400 font-bold' : ''}>
              1. Requirements
            </span>
            <span className={project.progress_percentage! >= 60 ? 'text-blue-400 font-bold' : ''}>
              2. Draft & Artifacts
            </span>
            <span className={project.progress_percentage! >= 90 ? 'text-blue-400 font-bold' : ''}>
              3. Review & Output
            </span>
          </div>
        </div>

        {/* Interactive Simulation Trigger */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          {/* <span className="text-[11px] text-slate-400">
            {project.status === 'Completed'
              ? 'Deliverables finalized!'
              : 'Simulate next AI Agent processing step:'}
          </span> */}

          {/* {project.status !== 'Completed' && (
            <Button
              variant="secondary"
              size="sm"
              isLoading={isSimulating}
              onClick={handleSimulateNextStep}
              icon={<Play className="w-3.5 h-3.5" />}
              className="bg-blue-600 hover:bg-blue-500 text-white border-none text-xs"
            >
              Advance Agent Step
            </Button>
          )} */}

          {project.status === 'Completed' && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Ready for Download
            </span>
          )}
        </div>
      </div>
    </div>
  );
};