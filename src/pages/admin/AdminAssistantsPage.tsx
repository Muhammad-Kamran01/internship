import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Search,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  DollarSign,
  FolderKanban,
  FileText,
  UserCheck,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { AssistantProfile, AssistantApprovalStatus } from '../../types';

export const AdminAssistantsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [assistants, setAssistants] = useState<AssistantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantProfile | null>(null);
  const [actionModal, setActionModal] = useState<AssistantApprovalStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAssistants = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllAssistants({
        approvalStatus: approvalFilter,
        search,
      });
      setAssistants(data);
    } catch (err) {
      console.error('Error loading assistants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssistants();
  }, [approvalFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAssistants();
  };

  const handleApprovalUpdate = async () => {
    if (!selectedAssistant || !actionModal) return;
    setIsSubmitting(true);
    try {
      await adminService.updateAssistantApproval(selectedAssistant.id, actionModal, currentAdmin);
      await loadAssistants();
      setActionModal(null);
      setSelectedAssistant(null);
    } catch (err) {
      console.error('Error updating approval:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getApprovalBadge = (status?: AssistantApprovalStatus) => {
    switch (status) {
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Pending Verification
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Suspended
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified & Approved
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Academic Assistants & Verification"
      subtitle="Monitor assistant expertise, performance statistics, proposal conversions and approve marketplace credentials"
      onRefresh={loadAssistants}
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
            placeholder="Search assistants by name, domain expertise, skills or university..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-full md:w-auto text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Approval Statuses</option>
            <option value="Approved">Verified / Approved</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Suspended">Suspended</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid of Assistants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading assistants database...</div>
        ) : assistants.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No academic assistants found.
          </div>
        ) : (
          assistants.map((ast) => (
            <div
              key={ast.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        ast.profile_photo ||
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={ast.full_name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <NavLink
                        to={`/admin/users/${ast.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-purple-600 transition-colors block"
                      >
                        {ast.full_name}
                      </NavLink>
                      <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[160px]">
                        {ast.academic_degree || 'Academic Expert'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="mt-3 flex items-center justify-between">
                  {getApprovalBadge(ast.approval_status)}
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{ast.rating || 5.0}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({ast.reviews_count || 0})</span>
                  </div>
                </div>

                {/* Institution & Details */}
                <p className="mt-3 text-xs text-slate-600 font-medium truncate">
                  🏛️ {ast.institution || 'Independent Assistant'}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {(ast.skills || ['Academic Writing', 'Python', 'Research']).slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-4 pt-3 border-t border-slate-100">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Done</span>
                    <span className="font-bold text-slate-900">{ast.completed_projects_count || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-50">
                    <span className="text-[10px] text-purple-600 block uppercase font-bold">Proposals</span>
                    <span className="font-bold text-purple-900">{ast.proposals_count || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50">
                    <span className="text-[10px] text-emerald-600 block uppercase font-bold">Earned</span>
                    <span className="font-bold text-emerald-900">
                      PKR {ast.total_earnings ? `${Math.round(ast.total_earnings / 1000)}k` : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                {ast.approval_status === 'Pending Approval' || ast.approval_status === 'Suspended' ? (
                  <button
                    onClick={() => {
                      setSelectedAssistant(ast);
                      setActionModal('Approved');
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Assistant</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedAssistant(ast);
                      setActionModal('Suspended');
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </button>
                )}

                <NavLink
                  to={`/admin/users/${ast.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Profile
                </NavLink>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {actionModal && selectedAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {actionModal === 'Approved' ? 'Approve Assistant Verification' : 'Suspend Assistant Access'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You are about to change the verification status of <strong>{selectedAssistant.full_name}</strong> to{' '}
              <strong>{actionModal}</strong>.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : `Confirm ${actionModal}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
