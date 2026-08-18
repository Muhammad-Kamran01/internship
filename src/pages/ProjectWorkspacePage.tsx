import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { projectService } from '../services/supabase/projectService';
import { proposalService } from '../services/supabase/proposalService';
import { useAuth } from '../context/AuthContext';
import { Project, Delivery, Comment } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  Send,
  Upload,
  Paperclip,
  Download,
  AlertCircle,
  MessageSquare,
  FileText,
  User,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const ProjectWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [project, setProject] = useState<Project | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Delivery Form State
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  // Comment State
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (id) loadWorkspaceData(id);
  }, [id]);

  const loadWorkspaceData = async (projectId: string) => {
    setLoading(true);
    const proj = await projectService.getProjectById(projectId);
    setProject(proj);

    const dels = await proposalService.getDeliveriesForProject(projectId);
    setDeliveries(dels);

    const comms = await projectService.getProjectComments(projectId);
    setComments(comms);

    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !user) return;

    if (!deliveryMessage.trim()) {
      alert('Please include a message describing your completed work delivery.');
      return;
    }

    setSubmittingDelivery(true);
    try {
      await proposalService.submitDelivery(
        {
          project_id: project.id,
          freelancer_id: user.id,
          freelancer_name: user.full_name || 'Assistant Specialist',
          delivery_message: deliveryMessage,
          notes: deliveryNotes,
        },
        attachedFiles
      );

      setDeliverySuccess(true);
      setShowDeliveryModal(false);
      setDeliveryMessage('');
      setDeliveryNotes('');
      setAttachedFiles([]);
      loadWorkspaceData(project.id);
    } catch (err: any) {
      alert('Error submitting delivery: ' + err.message);
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !user || !newComment.trim()) return;

    setSendingComment(true);
    try {
      await projectService.addComment({
        project_id: project.id,
        user_id: user.id,
        user_name: user.full_name || 'Assistant',
        user_role: 'freelancer',
        message: newComment.trim(),
      });

      setNewComment('');
      const updatedComms = await projectService.getProjectComments(project.id);
      setComments(updatedComms);
    } catch (err: any) {
      console.warn('Comment error:', err);
    } finally {
      setSendingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading project workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
        <button
          onClick={() => navigate('/freelancer/active-projects')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Back to Active Workspaces
        </button>
      </div>
    );
  }

  const latestDelivery = deliveries[0];
  const isRevisionRequested = project.status === 'Review' && latestDelivery?.status === 'Revision Requested';

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
          title={`Workspace: ${project.title}`}
          subtitle={`Student: ${project.student_name || 'Student'} • Status: ${project.status}`}
        />

        <OnboardingModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          role="freelancer"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => navigate('/freelancer/active-projects')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Active Workspaces
            </button>

            {project.status !== 'Completed' ? (
              <button
                onClick={() => setShowDeliveryModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Submit Work Delivery
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Project Completed & Paid
              </div>
            )}
          </div>

          {/* Project Completed Banner */}
          {project.status === 'Completed' && (
            <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-white">Work Delivery Approved & Earnings Released!</h4>
                  <p className="text-xs text-emerald-200">
                    The student has accepted the final deliverables. Your payment of {formatCurrency(project.budget)} has been credited to your Available Balance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/freelancer/earnings')}
                className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                View Earnings & Payouts →
              </button>
            </div>
          )}

          {/* Revision Needed Alert Banner */}
          {isRevisionRequested && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-900 space-y-2 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Student Requested Work Revision
                </h4>
                <p className="text-xs leading-relaxed font-medium">
                  {latestDelivery?.revision_notes || 'The student requested changes before approving final payment.'}
                </p>
                <button
                  onClick={() => setShowDeliveryModal(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Upload Revised Delivery
                </button>
              </div>
            </div>
          )}

          {/* Main Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Overview & Deliveries History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Requirements Summary Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Project Brief & Instructions
                  </h3>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Budget: {formatCurrency(project.budget)}
                  </span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {project.description}
                </div>

                {/* Student Uploads */}
                {project.files && project.files.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Student Reference Files ({project.files.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {project.files.map((f) => (
                        <a
                          key={f.id}
                          href={f.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-800 truncate">{f.file_name}</span>
                          <Download className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submitted Deliveries History Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Work Deliveries History
                  </h3>
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    + New Delivery
                  </button>
                </div>

                {deliveries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <Upload className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>No work submitted yet. Click "Submit Work Delivery" when ready.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deliveries.map((del) => (
                      <div
                        key={del.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Submitted by {del.freelancer_name}
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

                        <p className="text-slate-700 leading-relaxed font-normal">{del.delivery_message}</p>

                        {del.files && del.files.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Deliverable Files</span>
                            <div className="flex flex-wrap gap-2">
                              {del.files.map((f) => (
                                <a
                                  key={f.id}
                                  href={f.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-white border border-slate-200 rounded-xl font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1.5"
                                >
                                  <Paperclip className="w-3.5 h-3.5" /> {f.file_name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Project Discussion / Comments */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col h-[520px]">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" /> Project Discussion
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Real-time Chat</span>
                </div>

                {/* Comment Feed */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {comments.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No messages yet. Send a message to start communicating with the student.
                    </div>
                  ) : (
                    comments.map((c) => {
                      const isMe = c.user_role === 'freelancer' || c.user_id === user?.id;

                      return (
                        <div
                          key={c.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] font-semibold text-slate-400 mb-0.5">
                            {c.user_name}
                          </span>
                          <div
                            className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-900 rounded-bl-none'
                            }`}
                          >
                            {c.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Comment Input Form */}
                <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Type message to student..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingComment || !newComment.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Submit Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" /> Submit Completed Deliverable
              </h3>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Delivery Summary & Message to Student
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what work has been completed, key findings, and guidance for student review..."
                  value={deliveryMessage}
                  onChange={(e) => setDeliveryMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Attach Deliverable Files
                </label>
                <label className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <Paperclip className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700">Click to upload deliverable files</span>
                  <span className="text-[10px] text-slate-400">PDF, DOCX, ZIP, Code files supported</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {attachedFiles.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800"
                      >
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingDelivery}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submittingDelivery ? 'Submitting Work...' : 'Send Delivery to Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};