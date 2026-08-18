import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useProjects } from '../hooks/useProjects';
import { ACADEMIC_CATEGORIES } from '../constants/categories';
import { ProjectStatus } from '../types';
import { PlusCircle, Search, Filter, FolderKanban } from 'lucide-react';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.assigned_agent && p.assigned_agent.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const statusTabs = ['All', 'Submitted', 'Analyzing', 'In Progress', 'Review', 'Completed'];

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
          title="My Academic Projects"
          subtitle="All submitted assignments, FYPs, SRS, and projects."
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Project Portfolio</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredProjects.length} of {projects.length} academic tasks
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/projects/new')}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Submit New Project
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Inputs & Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search project title or agent..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {ACADEMIC_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Cards Grid */}
          {loading ? (
            <SkeletonList count={4} />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              title="No Projects Match Your Search"
              description="Try adjusting your status filters or search term to locate your academic project."
              actionText="Submit New Task"
              onAction={() => navigate('/projects/new')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
