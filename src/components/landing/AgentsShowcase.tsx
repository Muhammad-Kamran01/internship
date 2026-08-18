import React, { useState } from 'react';
import { AI_AGENTS } from '../../constants/aiAgents';
import { AIAgent } from '../../types';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { Bot, Star, Sparkles, CheckCircle2, ArrowRight, Code2, FileCode2, Presentation, Search, PenTool, LineChart } from 'lucide-react';

export const AgentsShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const getAgentIcon = (iconName: string) => {
    const size = 'w-6 h-6 text-blue-600';
    if (iconName === 'FileCode2') return <FileCode2 className={size} />;
    if (iconName === 'Code2') return <Code2 className={size} />;
    if (iconName === 'Presentation') return <Presentation className={size} />;
    if (iconName === 'Search') return <Search className={size} />;
    if (iconName === 'PenTool') return <PenTool className={size} />;
    return <LineChart className={size} />;
  };

  return (
    <section id="ai-agents" className="py-16 bg-slate-50/80 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Specialized Workforce
          </span>
          <h2 className="mt-4text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Specialized Assistants
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Each assistant is trained on specialized academic disciplines to draft, code, format, and audit academic assignments.
          </p>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AI_AGENTS.map((agent) => (
            <Card key={agent.id} hoverable className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                    {getAgentIcon(agent.iconName)}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {agent.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{agent.name}</h3>
                <p className="text-xs font-semibold text-blue-600 mb-3">{agent.specialization}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{agent.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {agent.rating} Rating
                  </span>
                  <span className="font-medium text-slate-700">{agent.tasksCompleted}+ Tasks Completed</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold justify-center"
                  onClick={() => setSelectedAgent(agent)}
                  icon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                >
                  View Agent Capabilities
                </Button>
              </div>
            </Card>
          ))}
        </div> */}
      </div>

      {/* Detail Modal */}
      {selectedAgent && (
        <Modal
          isOpen={Boolean(selectedAgent)}
          onClose={() => setSelectedAgent(null)}
          title={selectedAgent.name}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <Bot className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedAgent.specialization}</p>
                <p className="text-xs text-blue-700 font-semibold">{selectedAgent.badge}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{selectedAgent.description}</p>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Capabilities:</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automated preliminary outline and methodology structuring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>IEEE, APA, and MLA standard formatting checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Integrated Turnitin-compatible originality audit</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setSelectedAgent(null);
                  navigate('/projects/new');
                }}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Assign Task to {selectedAgent.name}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
