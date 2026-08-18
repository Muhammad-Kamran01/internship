import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import {
  Clock,
  Search,
  Shield,
  Filter,
  User,
  FolderKanban,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { AdminAuditLog } from '../../types';

export const AdminActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs({
        action: actionFilter,
        search,
      });
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.includes('USER')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (action.includes('ASSISTANT') || action.includes('APPROVAL')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('PROJECT')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (action.includes('DELIVERY')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <AdminLayout
      title="Platform Audit Trail & Security Logs"
      subtitle="Complete chronological history of all administrative interventions, status modifications, role adjustments and platform actions"
      onRefresh={loadLogs}
      isRefreshing={loading}
    >
      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by admin, target, action or detail keywords..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full md:w-auto text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Audit Actions ({logs.length})</option>
            <option value="UPDATE_USER_STATUS">User Status Updates</option>
            <option value="UPDATE_USER_ROLE">User Role Changes</option>
            <option value="UPDATE_ASSISTANT_APPROVAL">Assistant Approvals</option>
            <option value="UPDATE_PROJECT_STATUS">Project Status Interventions</option>
            <option value="ASSIGN_ASSISTANT">Assistant Assignments</option>
            <option value="INTERVENE_DELIVERY">Delivery Interventions</option>
            <option value="CREATE_ANNOUNCEMENT">System Announcements</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Admin Performed By</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Loading security audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Admin */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {log.admin_name || 'System Administrator'}
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px] max-w-[160px] truncate">
                      {log.target_type}: {log.target_id?.substring(0, 12)}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-[320px]">
                      <p className="line-clamp-2">{log.details || 'Action completed successfully.'}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
