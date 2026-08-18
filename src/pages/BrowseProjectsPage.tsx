import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { projectService } from '../services/supabase/projectService';
import { proposalService } from '../services/supabase/proposalService';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { ACADEMIC_CATEGORIES } from '../constants/categories';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  ArrowRight,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';

export const BrowseProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [submittedProjectIds, setSubmittedProjectIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [minBudget, setMinBudget] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'budget-high' | 'deadline'>('newest');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const allProjects = await projectService.getProjects();
    setProjects(allProjects);

    if (user) {
      const myProposals = await proposalService.getProposalsForFreelancer(user.id);
      const submittedIds = new Set(myProposals.map((p) => p.project_id));
      setSubmittedProjectIds(submittedIds);
    }
    setLoading(false);
  };

  // Collect unique skills from all projects for filter dropdown
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    projects.forEach((p) => {
      p.required_skills?.forEach((s) => skillsSet.add(s));
    });
    return Array.from(skillsSet);
  }, [projects]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Only show open / submitted / analyzing projects for proposals
        const isOpen = ['Submitted', 'Analyzing'].includes(p.status);
        if (!isOpen) return false;

        // Search query (title, description, category, student name)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchSkills = p.required_skills?.some((s) => s.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCat && !matchSkills) return false;
        }

        // Category Filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Skill Filter
        if (selectedSkill !== 'All' && !p.required_skills?.includes(selectedSkill)) {
          return false;
        }

        // Minimum Budget Filter
        if (minBudget > 0 && (p.budget || 0) < minBudget) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'budget-high') {
          return (b.budget || 0) - (a.budget || 0);
        }
        if (sortBy === 'deadline') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return 0;
      });
  }, [projects, searchQuery, selectedCategory, selectedSkill, minBudget, sortBy]);

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
          title="Browse Available Student Projects"
          subtitle="Explore academic tasks, submit proposals, and assist students with their projects"
        />

        <OnboardingModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          role="freelancer"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Upwork-Style Academic Marketplace
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Find Your Next Academic Project
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Review verified student submissions across FYP, Thesis Writing, Software Engineering, Literature Reviews, and Data Analysis. Submit custom proposals with your proposed price and delivery schedule.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[110px]">
                <span className="block text-2xl font-black text-white">{filteredProjects.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Open Tasks</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[110px]">
                <span className="block text-2xl font-black text-indigo-300">{submittedProjectIds.size}</span>
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">My Proposals</span>
              </div>
            </div>
          </div>

          {/* Search Bar & Filters Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search projects by title, description, or required skills (e.g. React, Thesis, Python)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0 hidden sm:inline" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full md:w-auto"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="budget-high">Sort: Highest Budget</option>
                  <option value="deadline">Sort: Soonest Deadline</option>
                </select>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              {/* Category Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {ACADEMIC_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Required Skill
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Skills</option>
                  {allSkills.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimum Budget Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Min Budget: ${minBudget}
                </label>
                <input
                  type="range"
                  min={0}
                  max={300}
                  step={20}
                  value={minBudget}
                  onChange={(e) => setMinBudget(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                />
              </div>
            </div>
          </div>

          {/* Project List / Grid */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Loading open student projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 max-w-lg mx-auto">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Projects Found</h3>
              <p className="text-xs text-slate-500">
                No student projects matched your search criteria or filter options. Try resetting your search filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedSkill('All');
                  setMinBudget(0);
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const hasSubmitted = submittedProjectIds.has(project.id);

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-4"
                  >
                    {/* Top Row: Category, Student & Status Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                          {project.category}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          Posted by <strong className="text-slate-800">{project.student_name || 'Student'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Proposal Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            <Clock className="w-3.5 h-3.5 text-blue-600" /> Open for Proposals
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Project Title & Short Description */}
                    <div>
                      <h3
                        onClick={() => navigate(`/freelancer/projects/${project.id}`)}
                        className="text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                        {project.description}
                      </p>
                    </div>

                    {/* Required Skills Tags */}
                    {project.required_skills && project.required_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {project.required_skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-lg transition-colors cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Metadata Bar & Action Button */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Budget: <strong className="text-slate-900 font-bold">{formatCurrency(project.budget)}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            Deadline: <strong className="text-slate-900">{formatDate(project.deadline)}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>
                            Proposals: <strong className="text-slate-900">{project.proposals_count || 0}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/freelancer/projects/${project.id}`)}
                        className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer ${
                          hasSubmitted
                            ? 'bg-slate-800 hover:bg-slate-900'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {hasSubmitted ? 'View Project & Proposal' : 'Submit Proposal'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
