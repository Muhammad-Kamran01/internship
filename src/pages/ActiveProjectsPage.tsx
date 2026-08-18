import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { proposalService } from '../services/supabase/proposalService';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';

export const ActiveProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadActiveProjects();
  }, [user]);

  const loadActiveProjects = async () => {
    if (!user) return;
    setLoading(true);
    const projects = await proposalService.getActiveProjectsForFreelancer(user.id);
    setActiveProjects(projects);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-800 bg-blue-100 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> In Progress
          </span>
        );
      case 'Review':
      case 'Submitted for Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-800 bg-purple-100 border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Under Student Review
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Revision Requested
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar className="hidden lg:flex shrink-0 border-r border-slate-200/80 sticky top-0 h-screen" />

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/50 backdrop-blur-xs">
          <Sidebar
            className="w-72 h-full shadow-2xl"
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenHelp={() => setShowWelcomeModal(true)}
          title="Active Project Workspaces"
          subtitle="Manage active student projects, upload deliverables, and communicate in real-time"
        />

        <OnboardingModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          role="freelancer"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                Assistant Operations
              </span>
              <h1 className="text-xl sm:text-2xl font-black">My Active Student Workspaces</h1>
              <p className="text-xs text-slate-300">
                Complete milestones, respond to student comments, and submit final deliverables.
              </p>
            </div>

            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center shrink-0">
              <span className="block text-2xl font-black text-emerald-400">{activeProjects.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-300">Assigned Projects</span>
            </div>
          </div>

          {/* Active Projects List */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Loading active project workspaces...</p>
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Active Projects</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You do not have any accepted active projects right now. Submit proposals to get started!
              </p>
              <button
                onClick={() => navigate('/freelancer/projects')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                Browse Open Student Tasks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Category & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {project.category}
                      </span>
                      {getStatusBadge(project.status)}
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Student: <strong className="text-slate-800">{project.student_name || 'Student User'}</strong>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-slate-500">Completion Progress</span>
                        <span className="text-indigo-600">{project.progress_percentage || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Budget</span>
                        <span className="font-extrabold text-slate-900">{formatCurrency(project.budget)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Deadline</span>
                        <span className="font-bold text-slate-800">{formatDate(project.deadline)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Open Workspace Action */}
                  <button
                    onClick={() => navigate(`/freelancer/projects/${project.id}/workspace`)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Open Workspace & Deliverables</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
