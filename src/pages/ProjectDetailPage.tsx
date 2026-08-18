import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { ProjectStatusStepper } from '../components/projects/ProjectStatusStepper';
import { AIAgentStatusCard } from '../components/dashboard/AIAgentStatusCard';
import { ProjectComments } from '../components/projects/ProjectComments';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { projectService } from '../services/supabase/projectService';
import { proposalService } from '../services/supabase/proposalService';
import { Project, ProjectFile, Proposal, Delivery } from '../types';
import { formatDate, formatCurrency, formatFileSize } from '../utils/formatters';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Plus,
  Bot,
  Shield,
  CheckCircle2,
  UserCheck,
  Sparkles,
  User,
  PackageCheck,
  RefreshCw,
  AlertCircle,
  Paperclip,
  Award,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null);

  // Delivery Approval & Revision State
  const [isApprovingDelivery, setIsApprovingDelivery] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  const loadProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await projectService.getProjectById(id);
    setProject(data);

    const propsList = await proposalService.getProposalsForProject(id);
    setProposals(propsList);

    const delsList = await proposalService.getDeliveriesForProject(id);
    setDeliveries(delsList);

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleAcceptProposal = async (proposal: Proposal) => {
    if (!project) return;
    if (window.confirm(`Accept proposal from ${proposal.freelancer_name || 'Assistant'} for ${formatCurrency(proposal.proposed_price)}?`)) {
      setAcceptingProposalId(proposal.id);
      await proposalService.acceptProposal(
        proposal.id,
        project.id,
        proposal.freelancer_name || 'Assistant Specialist',
        proposal.freelancer_id
      );
      setAcceptingProposalId(null);
      loadProject();
    }
  };

  const handleApproveDelivery = async () => {
    if (!project) return;
    if (
      window.confirm(
        `Are you sure you want to approve this work delivery and mark the project as Completed? This will release the payment to the Assistant.`
      )
    ) {
      setIsApprovingDelivery(true);
      try {
        await proposalService.acceptDelivery(project.id, project.student_id);
        await loadProject();
        alert('🎉 Delivery approved! The project has been marked as Completed.');
      } catch (err: any) {
        alert('Error approving delivery: ' + err.message);
      } finally {
        setIsApprovingDelivery(false);
      }
    }
  };

  const handleRequestRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !revisionNotes.trim()) return;

    setIsSubmittingRevision(true);
    try {
      await proposalService.requestRevision(project.id, revisionNotes.trim());
      setShowRevisionModal(false);
      setRevisionNotes('');
      await loadProject();
      alert('Revision request sent to the Assistant.');
    } catch (err: any) {
      alert('Error requesting revision: ' + err.message);
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !project) return;
    setIsUploadingFile(true);
    const file = e.target.files[0];

    await projectService.uploadProjectFile(project.id, file, project.student_id);
    setIsUploadingFile(false);
    loadProject();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading academic project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <h3 className="text-base font-bold text-slate-900 mb-1">Project Not Found</h3>
          <p className="text-xs text-slate-500 mb-4">The requested project task does not exist or was removed.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const latestDelivery = deliveries[0];
  const isReviewStage = project.status === 'Review' || latestDelivery?.status === 'Submitted for Review';
  const isCompletedStage = project.status === 'Completed' || latestDelivery?.status === 'Accepted';

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
          title={`Project #${project.id.slice(-6).toUpperCase()}`}
          subtitle={project.title}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Back Button & Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Projects List
            </button>

            <div className="flex items-center gap-2">
              <Badge variant="status" status={project.status} />
              <Badge variant="priority" priority={project.priority} />
            </div>
          </div>

          {/* Visual Progress Stepper */}
          <ProjectStatusStepper currentStatus={project.status} />

          {/* Prominent Action Banner for Deliverable Review */}
          {isReviewStage && (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <PackageCheck className="w-3.5 h-3.5" /> Final Work Delivery Submitted
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Assistant Completed Work — Ready for Student Review
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  Your assigned Assistant {latestDelivery?.freelancer_name ? `(${latestDelivery.freelancer_name})` : ''} has submitted the final project deliverable files. Please review the output below and approve to complete the project or request revisions.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Request Revision
                </button>
                <button
                  onClick={handleApproveDelivery}
                  disabled={isApprovingDelivery}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> {isApprovingDelivery ? 'Approving...' : 'Approve & Mark Completed'}
                </button>
              </div>
            </div>
          )}

          {/* Project Completed Celebration Banner */}
          {isCompletedStage && (
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Project Completed & Deliverables Approved!</h4>
                  <p className="text-xs text-emerald-200">
                    All academic milestones have been successfully delivered and verified.
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                100% Completed
              </span>
            </div>
          )}

          {/* Grid Layout: Details & Files (Left) vs AI Agent Status & Chat (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Info Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 mb-2 inline-block">
                    {project.category}
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 mt-1">{project.title}</h1>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Deadline</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> {formatDate(project.deadline)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Budget</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {formatCurrency(project.budget)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Assistant</span>
                    <span className="font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                      <Bot className="w-3.5 h-3.5" /> {project.assigned_agent || 'Assigning...'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Project Instructions
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Work Deliveries Received Card */}
              {deliveries.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Submitted Work Deliveries ({deliveries.length})
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">Assistant Deliverable Submissions</span>
                  </div>

                  <div className="space-y-4">
                    {deliveries.map((del) => (
                      <div
                        key={del.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Delivered by {del.freelancer_name || 'Assistant'}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              del.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : del.status === 'Revision Requested'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {del.status}
                          </span>
                        </div>

                        <p className="text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-100">
                          {del.delivery_message}
                        </p>

                        {del.files && del.files.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Deliverable Output Files ({del.files.length})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {del.files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={file.file_name}
                                  className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span className="truncate">{file.file_name}</span>
                                  </div>
                                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Review actions if pending */}
                        {del.status === 'Submitted for Review' && (
                          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-end gap-2">
                            <button
                              onClick={() => setShowRevisionModal(true)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Request Revision
                            </button>
                            <button
                              onClick={handleApproveDelivery}
                              disabled={isApprovingDelivery}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Mark Completed
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposals Received Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Proposals Received ({proposals.length})</h3>
                  </div>
                  <span className="text-xs text-slate-400">Upwork-style Assistant Bids</span>
                </div>

                {proposals.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No assistant proposals received yet for this task.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={prop.freelancer_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
                              alt="Assistant"
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{prop.freelancer_name || 'Academic Specialist'}</span>
                              <span className="text-[10px] text-slate-500">Submitted {formatDate(prop.created_at)}</span>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              prop.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prop.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-xl border border-slate-100 font-semibold">
                          <span>Bid Price: <strong className="text-slate-900">{formatCurrency(prop.proposed_price)}</strong></span>
                          <span>Est. Delivery: <strong className="text-slate-900">{prop.estimated_days} Days</strong></span>
                        </div>

                        <p className="text-slate-600 leading-relaxed font-normal">{prop.cover_letter}</p>

                        {prop.status === 'Pending' && (
                          <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                            <Button
                              variant="primary"
                              size="sm"
                              isLoading={acceptingProposalId === prop.id}
                              onClick={() => handleAcceptProposal(prop)}
                              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Accept Proposal & Hire Assistant
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attachments & Deliverables Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Project Files & Attachments</h3>
                  </div>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploadingFile}
                    />
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add File
                    </span>
                  </label>
                </div>

                {!project.files || project.files.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No attachments uploaded yet for this project.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                    {project.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {file.file_name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Uploaded by {file.uploaded_by} • {formatFileSize(file.file_size)}
                            </p>
                          </div>
                        </div>

                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={file.file_name}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-xs font-semibold text-slate-700 transition-colors shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* AI Agent Status Highlights */}
              <AIAgentStatusCard
                project={project}
                onProjectUpdated={() => loadProject()}
              />

              {/* Comments & AI Notes */}
              <ProjectComments
                projectId={project.id}
                assignedAgentName={project.assigned_agent}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Request Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" /> Request Work Revision
              </h3>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestRevisionSubmit} className="space-y-3">
              <p className="text-xs text-slate-600">
                Specify what changes, corrections, or additions you need the Assistant to make before you approve the final delivery.
              </p>

              <textarea
                rows={4}
                placeholder="e.g. Please update Chapter 3 citations to IEEE style and include the architecture diagram in higher resolution..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision || !revisionNotes.trim()}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingRevision ? 'Submitting...' : 'Send Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};