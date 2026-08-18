import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/supabase/projectService';
import { proposalService } from '../services/supabase/proposalService';
import { Project, Proposal } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Sparkles,
  Search,
  FileText,
  Briefcase,
  DollarSign,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  UserCheck,
} from 'lucide-react';

export const FreelancerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [openProjects, setOpenProjects] = useState<Project[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [earningsBalance, setEarningsBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const hasSeen = sessionStorage.getItem(`welcome_seen_assistant_${user.id}`);
      if (!hasSeen) {
        setShowWelcomeModal(true);
      }
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    const allProj = await projectService.getProjects();
    const openList = allProj.filter((p) => ['Submitted', 'Analyzing'].includes(p.status));
    setOpenProjects(openList);

    const props = await proposalService.getProposalsForFreelancer(user.id);
    setMyProposals(props);

    const activeList = await proposalService.getActiveProjectsForFreelancer(user.id);
    setActiveProjects(activeList);

    const earnData = await proposalService.getEarningsForFreelancer(user.id);
    setEarningsBalance(earnData.availableBalance);

    setLoading(false);
  };

  const handleCloseWelcome = () => {
    if (user) {
      sessionStorage.setItem(`welcome_seen_assistant_${user.id}`, 'true');
    }
    setShowWelcomeModal(false);
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
          title="Assistant Workspace Dashboard"
          subtitle="Browse academic tasks, manage proposals, coordinate active deliverables, and track earnings"
        />

        <OnboardingModal
          isOpen={showWelcomeModal}
          onClose={handleCloseWelcome}
          role="freelancer"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Welcome Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                <UserCheck className="w-3.5 h-3.5" /> Verified Academic Assistant
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Assistant'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                There are <strong className="text-white font-extrabold">{openProjects.length} open student tasks</strong> waiting for proposals. Help students achieve top grades while building your academic reputation.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={() => navigate('/freelancer/projects')}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" /> Browse Tasks
              </button>
              <button
                onClick={() => navigate('/freelancer/proposals')}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> My Proposals
              </button>
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/freelancer/projects')}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Open Tasks</span>
                <Search className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{openProjects.length}</p>
              <span className="text-[10px] text-indigo-600 font-bold block">Available to bid →</span>
            </div>

            <div
              onClick={() => navigate('/freelancer/proposals')}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Submitted Proposals</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{myProposals.length}</p>
              <span className="text-[10px] text-amber-600 font-bold block">View statuses →</span>
            </div>

            <div
              onClick={() => navigate('/freelancer/active-projects')}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Workspaces</span>
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{activeProjects.length}</p>
              <span className="text-[10px] text-emerald-600 font-bold block">Manage work →</span>
            </div>

            <div
              onClick={() => navigate('/freelancer/earnings')}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Available Balance</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(earningsBalance)}</p>
              <span className="text-[10px] text-blue-600 font-bold block">Withdraw payouts →</span>
            </div>
          </div>

          {/* Section: Open Student Projects Waiting for Proposals */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Search className="w-4.5 h-4.5 text-indigo-600" /> Recent Student Submissions
                </h3>
                <p className="text-xs text-slate-500">Student projects currently accepting assistant proposals</p>
              </div>

              <button
                onClick={() => navigate('/freelancer/projects')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({openProjects.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading projects...</div>
            ) : openProjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No open student tasks available at the moment.
              </div>
            ) : (
              <div className="space-y-3">
                {openProjects.slice(0, 4).map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {proj.category}
                        </span>
                        <h4 className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer" onClick={() => navigate(`/freelancer/projects/${proj.id}`)}>
                          {proj.title}
                        </h4>
                      </div>
                      <p className="text-slate-500 line-clamp-1">{proj.description}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="block font-black text-slate-900">{formatCurrency(proj.budget)}</span>
                        <span className="text-[10px] text-slate-400">Due: {formatDate(proj.deadline)}</span>
                      </div>

                      <button
                        onClick={() => navigate(`/freelancer/projects/${proj.id}`)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                      >
                        Submit Proposal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Active Projects Quick List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4.5 h-4.5 text-emerald-600" /> Active Student Workspaces
                </h3>
                <p className="text-xs text-slate-500">Your assigned projects in progress</p>
              </div>

              <button
                onClick={() => navigate('/freelancer/active-projects')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All Workspaces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading workspaces...</div>
            ) : activeProjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You do not have any active project workspaces yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeProjects.slice(0, 2).map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 truncate">{proj.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">Student: {proj.student_name || 'Student'}</p>

                    <button
                      onClick={() => navigate(`/freelancer/projects/${proj.id}/workspace`)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Open Workspace
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};