import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import {
  Users,
  GraduationCap,
  Briefcase,
  FolderKanban,
  FileText,
  PackageCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Layers,
  CheckCircle2,
  XCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Plus,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { Project, Proposal, Delivery, AdminAuditLog } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await adminService.getDashboardOverview();
        setStats(data);
      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const getStatusBadgeColor = (status: string) => {
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
      title="Admin Command Center"
      subtitle="Complete real-time oversight of students, assistants, projects, deliveries & platform activity"
      onRefresh={handleRefresh}
      isRefreshing={loading}
    >
      {/* Top Warning Banner for Overdue Projects if any */}
      {stats?.overdueCount > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {stats.overdueCount} Project{stats.overdueCount > 1 ? 's' : ''} Past Deadline Requires Attention
              </p>
              <p className="text-xs text-amber-700">
                Some active projects have passed their scheduled deadline without a completed delivery.
              </p>
            </div>
          </div>
          <NavLink
            to="/admin/projects?filter=overdue"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            Review Overdue Projects
          </NavLink>
        </div>
      )}

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : stats?.totalUsers || 0}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
              <span className="text-blue-600 font-semibold">{stats?.totalStudents || 0} Students</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{stats?.totalAssistants || 0} Assistants</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <NavLink to="/admin/users" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              <span>Manage Users</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Projects</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : stats?.totalProjects || 0}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
              <span className="text-emerald-600 font-semibold">{stats?.completedProjects || 0} Done</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">{stats?.activeProjects || 0} In Progress</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <NavLink to="/admin/projects" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All Projects</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Deliveries & Quality */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deliveries Under Review</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : stats?.pendingDeliveries || 0}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
              <span className="text-slate-600">{stats?.completedDeliveries || 0} Accepted Submissions</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <NavLink to="/admin/deliveries" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              <span>Review Deliveries</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Platform Volume & Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Volume</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : `PKR ${(stats?.totalPlatformVolume || 0).toLocaleString()}`}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
              <span className="text-slate-600">PKR {(stats?.pendingVolume || 0).toLocaleString()} in pipeline</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <NavLink to="/admin/reports" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <span>Financial Reports</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Workflow Quick Links Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
              Administrative Quick Actions
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Rapidly trigger platform broadcasts, manage academic categories or inspect recent proposals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <NavLink
              to="/admin/notifications"
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Broadcast Announcement</span>
            </NavLink>
            <NavLink
              to="/admin/categories"
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-600"
            >
              <span>Manage Categories</span>
            </NavLink>
            <NavLink
              to="/admin/assistants"
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-600"
            >
              <span>Verify Assistants</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Middle Split: Status Breakdown & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Pipeline Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Project Lifecycle Pipeline</h3>
              <p className="text-xs text-slate-500">Breakdown of all student projects by current workflow stage</p>
            </div>
            <NavLink to="/admin/projects" className="text-xs font-semibold text-purple-600 hover:text-purple-700">
              View All →
            </NavLink>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100">
              <p className="text-[11px] font-bold text-purple-700 uppercase">Submitted / New</p>
              <p className="text-xl sm:text-2xl font-black text-purple-900 mt-1">
                {(stats?.statusCounts?.Submitted || 0) + (stats?.statusCounts?.Analyzing || 0)}
              </p>
              <span className="text-[10px] text-purple-600">Awaiting Proposals</span>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <p className="text-[11px] font-bold text-indigo-700 uppercase">Assigned</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-900 mt-1">
                {stats?.statusCounts?.Assigned || 0}
              </p>
              <span className="text-[10px] text-indigo-600">Proposal Accepted</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <p className="text-[11px] font-bold text-blue-700 uppercase">In Progress</p>
              <p className="text-xl sm:text-2xl font-black text-blue-900 mt-1">
                {stats?.statusCounts?.['In Progress'] || 0}
              </p>
              <span className="text-[10px] text-blue-600">Active Work</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <p className="text-[11px] font-bold text-emerald-700 uppercase">Completed</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">
                {stats?.statusCounts?.Completed || 0}
              </p>
              <span className="text-[10px] text-emerald-600">Delivered & Closed</span>
            </div>
          </div>

          {/* Recent Projects Table Preview */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Recently Active Projects</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                    <th className="pb-2 font-bold">Project Title</th>
                    <th className="pb-2 font-bold">Student</th>
                    <th className="pb-2 font-bold">Category</th>
                    <th className="pb-2 font-bold">Budget</th>
                    <th className="pb-2 font-bold">Status</th>
                    <th className="pb-2 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recentProjects?.map((p: Project) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800 max-w-[200px] truncate">{p.title}</td>
                      <td className="py-2.5 text-slate-600">{p.student_name || 'Student'}</td>
                      <td className="py-2.5 text-slate-500">{p.category}</td>
                      <td className="py-2.5 font-medium text-slate-800">PKR {(p.budget || 0).toLocaleString()}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <NavLink
                          to={`/admin/projects/${p.id}`}
                          className="text-purple-600 hover:text-purple-800 font-semibold"
                        >
                          Details
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Breakdown & Audit Trail Summary */}
        <div className="space-y-6">
          {/* Category Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Category Demand</h3>
              <NavLink to="/admin/categories" className="text-xs font-semibold text-purple-600 hover:underline">
                Manage
              </NavLink>
            </div>
            <div className="space-y-2.5">
              {stats?.categoryCounts &&
                Object.entries(stats.categoryCounts).map(([catName, count]: any) => (
                  <div key={catName}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 truncate max-w-[180px]">{catName}</span>
                      <span className="font-bold text-slate-900">{count} project{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, ((count as number) / (stats.totalProjects || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Platform Audit Trail</h3>
              <NavLink to="/admin/activity" className="text-xs font-semibold text-purple-600 hover:underline">
                Full Log
              </NavLink>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {stats?.recentActivity?.map((log: AdminAuditLog) => (
                <div key={log.id} className="text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.details && <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{log.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
