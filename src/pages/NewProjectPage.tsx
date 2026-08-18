import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { FileUploader } from '../components/projects/FileUploader';
import { AIPreAnalyzer } from '../components/projects/AIPreAnalyzer';
import { Button } from '../components/common/Button';
import { useProjects } from '../hooks/useProjects';
import { ACADEMIC_CATEGORIES } from '../constants/categories';
import { ProjectPriority } from '../types';
import { PlusCircle, ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(ACADEMIC_CATEGORIES[0].name);
  const [deadline, setDeadline] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    return defaultDate.toISOString().split('T')[0];
  });
  const [budget, setBudget] = useState<number | ''>(100);
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive project title.');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setErrorMsg('Please provide a detailed description (at least 20 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const newProj = await createProject(
        {
          title,
          description,
          category,
          deadline,
          budget: Number(budget) || 0,
          priority,
        },
        attachedFiles
      );

      setIsSubmitting(false);
      navigate(`/projects/${newProj.id}`);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit project task.');
    }
  };

  const handleApplyAIEstimate = (suggestedBudget: number, suggestedDays: number) => {
    setBudget(suggestedBudget);
    const date = new Date();
    date.setDate(date.getDate() + suggestedDays);
    setDeadline(date.toISOString().split('T')[0]);
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
          title="Submit Academic Task"
          subtitle="Provide task instructions, upload documents, and connect with experts."
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          {/* AI Pre-Analyzer Widget */}
          {/* <AIPreAnalyzer
            title={title}
            description={description}
            category={category}
            filesCount={attachedFiles.length}
            onApplyEstimate={handleApplyAIEstimate}
          /> */}

          {errorMsg && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="border-b border-slate-100 pb-4 text-center">
              <h2 className="text-lg font-bold text-slate-900">Project Requirements</h2>
              <p className="text-xs text-slate-500">
                Provide clear instructions for our specialized assistant.
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Smart Attendance System using Facial Recognition (FYP)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Academic Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                >
                  {ACADEMIC_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Priority Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Project Instructions & Requirements <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe project goals, guidelines, required technologies (e.g. React, Python, IEEE standard), and specific sections needed..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              ></textarea>
            </div>

            {/* Deadline & Budget Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Submission Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
  <label className="text-xs font-bold text-slate-700 block mb-1">
    Allocated Budget (PKR) <span className="text-slate-400 font-normal">(Optional)</span>
  </label>
  <div className="relative">
    <span className="text-xs text-slate-400 absolute left-3 top-2.5 font-bold pointer-events-none select-none">
      PKR
    </span>
    <input
      type="number"
      min={0}
      value={budget}
      onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
      placeholder=""
      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
    />
  </div>
</div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Attach Supporting Documents, Code Files and Scope
              </label>
              <FileUploader files={attachedFiles} onChange={setAttachedFiles} />
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate('/dashboard')}
                className="bg-red-100 text-red-700 hover:bg-red-200 border-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                icon={<Send className="w-4 h-4" />}
                className="shadow-md"
              >
                Submit Project
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
