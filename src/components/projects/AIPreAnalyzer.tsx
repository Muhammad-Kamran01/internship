import React, { useState } from 'react';
import { Sparkles, Bot, Clock, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

interface AIPreAnalyzerProps {
  title: string;
  description: string;
  category: string;
  filesCount: number;
  onApplyEstimate?: (suggestedBudget: number, suggestedDays: number) => void;
}

export const AIPreAnalyzer: React.FC<AIPreAnalyzerProps> = ({
  title,
  description,
  category,
  filesCount,
  onApplyEstimate,
}) => {
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simple heuristic analysis for preliminary estimate
  const wordCount = description.trim().split(/\s+/).length;
  let estimatedDays = 3;
  let estimatedBudget = 80;
  let complexity: 'Standard' | 'Medium' | 'High' | 'Complex Academic' = 'Standard';
  let suggestedAgent = 'Documentation Assistant';

  if (category.includes('FYP') || category.includes('Thesis')) {
    estimatedDays = 5;
    estimatedBudget = 150;
    complexity = 'Complex Academic';
    suggestedAgent = 'Thesis & Research Assistant';
  } else if (category.includes('Programming') || category.includes('Code')) {
    estimatedDays = 3;
    estimatedBudget = 120;
    complexity = 'High';
    suggestedAgent = 'Programming Assistant';
  } else if (category.includes('Presentation')) {
    estimatedDays = 1;
    estimatedBudget = 50;
    complexity = 'Standard';
    suggestedAgent = 'Presentation Assistant';
  }

  if (wordCount > 100) {
    estimatedDays += 1;
    estimatedBudget += 25;
  }

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-blue-800/50 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Pre-Assessment Engine</h4>
            <p className="text-[11px] text-blue-200">Instant requirement analysis & automated turnaround forecast</p>
          </div>
        </div>

        {!analyzed && (
          <Button
            variant="secondary"
            size="sm"
            isLoading={isAnalyzing}
            onClick={handleRunAnalysis}
            icon={<Bot className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-500 text-white border-none text-xs"
          >
            Analyze Requirements
          </Button>
        )}
      </div>

      {analyzed && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <span className="text-[10px] text-slate-300 uppercase font-bold block mb-1">Assigned Assistant</span>
              <p className="text-xs font-bold text-blue-300 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-blue-400" /> {suggestedAgent}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <span className="text-[10px] text-slate-300 uppercase font-bold block mb-1">Complexity</span>
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> {complexity}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <span className="text-[10px] text-slate-300 uppercase font-bold block mb-1">Est. Turnaround</span>
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~{estimatedDays} Days
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <span className="text-[10px] text-slate-300 uppercase font-bold block mb-1">Recommended Budget</span>
              <p className="text-xs font-bold text-indigo-300">${estimatedBudget}.00 USD</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 bg-white/5 p-3 rounded-xl">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle className="w-4 h-4" /> Requirements analyzed ({filesCount} attached files detected).
            </span>

            {onApplyEstimate && (
              <button
                type="button"
                onClick={() => onApplyEstimate(estimatedBudget, estimatedDays)}
                className="text-xs font-bold text-blue-300 hover:text-white underline flex items-center gap-1"
              >
                Apply AI Recommendation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
