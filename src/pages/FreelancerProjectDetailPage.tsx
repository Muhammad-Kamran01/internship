import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { projectService } from '../services/supabase/projectService';
import { proposalService } from '../services/supabase/proposalService';
import { useAuth } from '../context/AuthContext';
import { Project, Proposal } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Download,
  User,
  Sparkles,
  Paperclip,
} from 'lucide-react';

export const FreelancerProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [project, setProject] = useState<Project | null>(null);
  const [existingProposal, setExistingProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  // Proposal Form State
  const [proposedPrice, setProposedPrice] = useState<number>(100);
  const [estimatedDays, setEstimatedDays] = useState<number>(7);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadProjectDetails(id);
  }, [id, user]);

  const loadProjectDetails = async (projectId: string) => {
    setLoading(true);
    const proj = await projectService.getProjectById(projectId);
    setProject(proj);

    if (proj) {
      setProposedPrice(proj.budget || 100);
    }

    if (user && projectId) {
      const proposals = await proposalService.getProposalsForFreelancer(user.id);
      const found = proposals.find((p) => p.project_id === projectId && p.status !== 'Withdrawn');
      if (found) {
        setExistingProposal(found);
      }
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !user) return;

    if (!coverLetter.trim() || coverLetter.trim().length < 20) {
      setErrorMsg('Please write a detailed cover letter (at least 20 characters) explaining how you will assist the student.');
      return;
    }

    if (proposedPrice <= 0) {
      setErrorMsg('Please enter a valid positive proposed price.');
      return;
    }

    if (estimatedDays <= 0) {
      setErrorMsg('Please enter a valid estimated delivery duration.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await proposalService.submitProposal(
        {
          project_id: project.id,
          freelancer_id: user.id,
          freelancer_name: user.full_name || 'Assistant Specialist',
          freelancer_photo: user.profile_photo,
          cover_letter: coverLetter,
          proposed_price: proposedPrice,
          estimated_days: estimatedDays,
        },
        attachedFile || undefined
      );

      setExistingProposal(created);
      setSuccessMsg('🎉 Your proposal has been submitted successfully! The student will review your application.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading project requirements...</p>
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
          onClick={() => navigate('/freelancer/projects')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Back to Browse Projects
        </button>
      </div>
    );
  }

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
          title={project.title}
          subtitle={`Submitted by ${project.student_name || 'Student'} • Category: ${project.category}`}
        />

        <OnboardingModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          role="freelancer"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Back Link */}
          <button
            onClick={() => navigate('/freelancer/projects')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Projects
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Complete Project Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Main Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    {project.category}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Posted on {formatDate(project.created_at)}
                  </span>
                </div>

                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 leading-snug">
                    {project.title}
                  </h1>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Budget</span>
                    <span className="text-lg font-black text-slate-900">{formatCurrency(project.budget)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Deadline</span>
                    <span className="text-sm font-bold text-slate-800">{formatDate(project.deadline)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Priority</span>
                    <span className="text-sm font-bold text-indigo-600">{project.priority}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Project Description & Requirements
                  </h3>
                  <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {project.description}
                  </div>
                </div>

                {/* Required Skills */}
                {project.required_skills && project.required_skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Required Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Files from Student */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Student Attached Files ({project.files?.length || 0})
                  </h3>
                  {!project.files || project.files.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No attachments provided by the student.</p>
                  ) : (
                    <div className="space-y-2">
                      {project.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{file.file_name}</span>
                          </div>
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white text-indigo-600 font-bold border border-slate-200 hover:bg-indigo-50 transition-colors shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Submit Proposal Form or Submitted Proposal Card */}
            <div className="space-y-6">
              {existingProposal ? (
                /* Already Submitted Proposal Card */
                <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0"></div>

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Proposal Submitted</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      You have already submitted a proposal for this project. Status:
                      <strong className="text-slate-900 ml-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md font-bold">
                        {existingProposal.status}
                      </strong>
                    </p>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Your Bid Price:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(existingProposal.proposed_price)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Estimated Days:</span>
                        <span className="font-bold text-slate-900">{existingProposal.estimated_days} Days</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Date Submitted:</span>
                        <span className="font-bold text-slate-900">{formatDate(existingProposal.created_at)}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Cover Letter
                      </span>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        {existingProposal.cover_letter}
                      </p>
                    </div>

                    {existingProposal.status === 'Accepted' && (
                      <button
                        onClick={() => navigate(`/freelancer/projects/${project.id}/workspace`)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Briefcase className="w-4 h-4" /> Go to Project Workspace
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/freelancer/proposals')}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                    >
                      View All My Proposals
                    </button>
                  </div>
                </div>
              ) : (
                /* Submit Proposal Card Form */
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-base">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <span>Submit Your Proposal</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Set your terms and explain how you can assist the student.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitProposal} className="space-y-4">
                    {/* Proposed Price */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Proposed Price ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="number"
                          min={10}
                          max={2000}
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Student Budget: {formatCurrency(project.budget)}
                      </span>
                    </div>

                    {/* Estimated Days */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Estimated Delivery Duration (Days)
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={estimatedDays}
                          onChange={(e) => setEstimatedDays(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Cover Letter & Execution Plan
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Detail your relevant academic experience, methodology, and how you will complete this project on time..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-normal"
                        required
                      />
                    </div>

                    {/* Optional File Attachment */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Attach Proposal Document (Optional)
                      </label>
                      <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <Paperclip className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600 font-semibold truncate">
                          {attachedFile ? attachedFile.name : 'Upload sample work / proposal outline'}
                        </span>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.zip"
                        />
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>Submitting Proposal...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Submit Proposal
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
