import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { proposalService } from '../services/supabase/proposalService';
import { useAuth } from '../context/AuthContext';
import { Proposal, ProposalStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  Briefcase,
  X,
  ExternalLink,
} from 'lucide-react';

export const ProposalsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProposalStatus | 'All'>('All');

  useEffect(() => {
    if (user) loadProposals();
  }, [user]);

  const loadProposals = async () => {
    if (!user) return;
    setLoading(true);
    const list = await proposalService.getProposalsForFreelancer(user.id);
    setProposals(list);
    setLoading(false);
  };

  const handleWithdraw = async (proposalId: string) => {
    if (window.confirm('Are you sure you want to withdraw this proposal?')) {
      await proposalService.withdrawProposal(proposalId);
      loadProposals();
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'All') return true;
    return p.status === activeTab;
  });

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-800 bg-rose-100 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Declined
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200">
            <X className="w-3.5 h-3.5 text-slate-500" /> Withdrawn
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
          title="My Proposals & Applications"
          subtitle="Track proposal statuses, manage active applications, and launch accepted project workspaces"
        />

        <OnboardingModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          role="freelancer"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Status Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {(['All', 'Pending', 'Accepted', 'Rejected', 'Withdrawn'] as const).map((tab) => {
              const count =
                tab === 'All'
                  ? proposals.length
                  : proposals.filter((p) => p.status === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{tab === 'All' ? 'All Proposals' : tab}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activeTab === tab
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Proposals List */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Loading your submitted proposals...</p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Proposals Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You have not submitted any proposals under this category yet.
              </p>
              <button
                onClick={() => navigate('/freelancer/projects')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Browse Student Projects
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {proposal.project_category || 'Academic Task'}
                      </span>
                      <h3
                        onClick={() => navigate(`/freelancer/projects/${proposal.project_id}`)}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {proposal.project_title || `Project #${proposal.project_id.slice(-6)}`}
                      </h3>
                    </div>

                    <div>{getStatusBadge(proposal.status)}</div>
                  </div>

                  {/* Proposal Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Your Bid Price</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(proposal.proposed_price)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Delivery Time</span>
                      <span className="font-bold text-slate-800">{proposal.estimated_days} Days</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Budget</span>
                      <span className="font-bold text-slate-800">{formatCurrency(proposal.project_budget)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Submitted Date</span>
                      <span className="font-bold text-slate-800">{formatDate(proposal.created_at)}</span>
                    </div>
                  </div>

                  {/* Cover Letter Snippet */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Cover Letter Excerpt
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100 line-clamp-2 leading-relaxed">
                      {proposal.cover_letter}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => navigate(`/freelancer/projects/${proposal.project_id}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Project Requirements
                    </button>

                    <div className="flex items-center gap-2">
                      {proposal.status === 'Pending' && (
                        <button
                          onClick={() => handleWithdraw(proposal.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Withdraw Proposal
                        </button>
                      )}

                      {proposal.status === 'Accepted' && (
                        <button
                          onClick={() => navigate(`/freelancer/projects/${proposal.project_id}/workspace`)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Briefcase className="w-3.5 h-3.5" /> Open Project Workspace
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
