import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { ProfileProgress } from '../components/dashboard/ProfileProgress';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { AIAgentStatusCard } from '../components/dashboard/AIAgentStatusCard';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/supabase/projectService';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { PlusCircle, ArrowRight, FolderKanban, Sparkles, Clock } from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projects, loading, refreshProjects } = useProjects();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  React.useEffect(() => {
    if (user) {
      projectService.getActivityLogs(user.id).then((logs) => setActivityLogs(logs));

      // Show welcome popup on login if not seen in current session
      const hasSeen = sessionStorage.getItem(`welcome_seen_${user.id}`);
      if (!hasSeen) {
        setShowWelcomeModal(true);
      }
    }
  }, [user]);

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    if (user) {
      sessionStorage.setItem(`welcome_seen_${user.id}`, 'true');
    }
  }

  // Find active project for AI Agent status highlight
  const activeProject = projects.find((p) =>
    ['Analyzing', 'Assigned', 'In Progress', 'Review'].includes(p.status)
  ) || projects[0];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex shrink-0 border-r border-slate-200/80 sticky top-0 h-screen" />

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/50 backdrop-blur-xs">
          <Sidebar
            className="w-72 h-full shadow-2xl"
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
          <div
            className="flex-1"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

          {/* Welcome Onboarding Modal Popup */}
        <OnboardingModal
          isOpen={showWelcomeModal}
          onClose={handleCloseWelcome}
          role="student"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner & Quick Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Student Workspace
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                Manage Academic Projects & Your Assistants
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit new assignments, monitor real-time progress, and download deliverables.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/projects/new')}
              icon={<PlusCircle className="w-4 h-4" />}
              className="shrink-0 shadow-md"
            >
              Submit New Project
            </Button>
          </div>

          {/* Stats Overview Grid */}
          <StatsOverview projects={projects} />

          {/* Active AI Agent Status Banner */}
          {activeProject && (
            <AIAgentStatusCard
              project={activeProject}
              onProjectUpdated={() => refreshProjects()}
            />
          )}

          {/* Main Grid: Projects (Left) vs Sidebar Widgets (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Recent Projects */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Recent Projects</h3>
                </div>
                <Link
                  to="/projects"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View All Projects ({projects.length})
                </Link>
              </div>

              {loading ? (
                <SkeletonList count={3} />
              ) : projects.length === 0 ? (
                <EmptyState
                  title="No Academic Projects Submitted"
                  description="Submit your first FYP, assignment, or SRS documentation to get started with our specialized AI Agents."
                  actionText="Submit Project Now"
                  onAction={() => navigate('/projects/new')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.slice(0, 4).map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 Cols: Widgets */}
            <div className="lg:col-span-4 space-y-6" style={{ marginTop: '45px'}}>
              {/* Profile Completion */}
              <ProfileProgress />

              {/* Activity Timeline */}
              {/* <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Recent Activity Log
                  </h4>
                </div>
                <ActivityTimeline logs={activityLogs} />
              </div> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
