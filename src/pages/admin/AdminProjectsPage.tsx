import React, { useState, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  FolderKanban,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  UserCheck,
  Calendar,
  DollarSign,
  Tag,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { Project, ProjectStatus, Profile } from '../../types';
import { ACADEMIC_CATEGORIES } from '../../constants/categories';

export const AdminProjectsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const initialOverdue = searchParams.get('filter') === 'overdue';
  const initialSearch = searchParams.get('search') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [assistants, setAssistants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(initialOverdue);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAssistantId, setSelectedAssistantId] = useState('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ProjectStatus>('Submitted');
  const [statusNote, setStatusNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [allProjects, allAssistants] = await Promise.all([
        adminService.getAllProjects({
          status: statusFilter,
          category: categoryFilter,
          search,
          overdueOnly,
          sortBy,
        }),
        adminService.getAllUsers({ role: 'freelancer' }),
      ]);
      setProjects(allProjects);
      setAssistants(allAssistants);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, categoryFilter, overdueOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleAssignSubmit = async () => {
    if (!selectedProject || !selectedAssistantId) return;
    const assistant = assistants.find((a) => a.id === selectedAssistantId);
    if (!assistant) return;

    setIsSubmitting(true);
    try {
      await adminService.assignAssistant(selectedProject.id, assistant.id, assistant.full_name, currentAdmin);
      await fetchProjects();
      setAssignModalOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error('Error assigning assistant:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      await adminService.updateProjectStatus(selectedProject.id, targetStatus, statusNote, currentAdmin);
      await fetchProjects();
      setStatusModalOpen(false);
      setSelectedProject(null);
      setStatusNote('');
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProjectOverdue = (p: Project) => {
    if (p.status === 'Completed' || p.status === 'Cancelled' || p.status === 'Rejected') return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return p.deadline && p.deadline < todayStr;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assigned':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Submitted':
      case 'Analyzing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <AdminLayout
      title="All Academic Projects"
      subtitle="Complete lifecycle inspection, status updates, assistant assignment & overdue monitoring"
      onRefresh={fetchProjects}
      isRefreshing={loading}
    >
      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title, keywords, student name or project ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted (New)</option>
              <option value="Analyzing">Analyzing</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Under Review</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer max-w-[170px] truncate"
            >
              <option value="all">All Categories</option>
              {ACADEMIC_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="deadline_soon">Deadline (Soonest)</option>
              <option value="budget_high">Budget (High to Low)</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/* Overdue Toggle button */}
            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                overdueOnly
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue Only</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Total filtered projects: <strong className="text-slate-900">{projects.length}</strong>
          </span>
          <span className="text-[11px] text-slate-400">
            Click on any project to view complete proposals, submissions & deliverable files
          </span>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Project Title & ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Budget & Proposals</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading project records...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No academic projects matching the current filters.
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const overdue = isProjectOverdue(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div>
                          <NavLink
                            to={`/admin/projects/${p.id}`}
                            className="font-bold text-slate-900 hover:text-purple-600 transition-colors block truncate"
                          >
                            {p.title}
                          </NavLink>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">{p.id}</span>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium truncate max-w-[140px]">{p.student_name || 'Student'}</div>
                        <span className="text-[10px] text-slate-400">ID: {p.student_id?.substring(0, 8)}</span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate">
                        {p.category}
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          PKR {(p.budget || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-purple-600 font-semibold">
                          {p.proposals_count || 0} Proposals
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={overdue ? 'text-rose-600 font-bold' : 'text-slate-700 font-medium'}>
                            {p.deadline}
                          </span>
                          {overdue && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700 uppercase">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <NavLink
                            to={`/admin/projects/${p.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </NavLink>

                          {/* Assign Assistant Button */}
                          <button
                            onClick={() => {
                              setSelectedProject(p);
                              setAssignModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                            title="Assign Assistant"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Status Update Button */}
                          <button
                            onClick={() => {
                              setSelectedProject(p);
                              setTargetStatus(p.status);
                              setStatusModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors"
                          >
                            Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Assistant Modal */}
      {assignModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Assign Academic Assistant</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select an approved academic assistant to work on "<strong>{selectedProject.title}</strong>".
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Assistant</label>
              <select
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2"
              >
                <option value="">-- Choose Verified Assistant --</option>
                {assistants.map((ast) => (
                  <option key={ast.id} value={ast.id}>
                    {ast.full_name} ({ast.academic_degree || 'Expert'})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                disabled={!selectedAssistantId || isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Assigning...' : 'Assign & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Update Project Status</h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifying status for "<strong>{selectedProject.title}</strong>".
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">New Workflow Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ProjectStatus)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="Submitted">Submitted (New)</option>
                  <option value="Analyzing">Analyzing</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Under Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Admin Audit Note (Optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Project finalized after reviewing delivery attachments..."
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
