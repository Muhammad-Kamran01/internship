import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  Shield,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  ArrowUpDown,
  Mail,
  Phone,
  Building,
  UserCheck,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { Profile, UserRole, UserStatus } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [actionModal, setActionModal] = useState<'status' | 'role' | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<UserStatus>('active');
  const [newRoleValue, setNewRoleValue] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers({
        role: roleFilter,
        status: statusFilter,
        search,
        sortBy,
      });
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await adminService.updateUserStatus(selectedUser.id, newStatusValue, currentAdmin);
      await fetchUsers();
      setActionModal(null);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await adminService.updateUserRole(selectedUser.id, newRoleValue, currentAdmin);
      await fetchUsers();
      setActionModal(null);
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Admin
          </span>
        );
      case 'freelancer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Briefcase className="w-3 h-3 text-emerald-600" />
            Assistant
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3 h-3 text-blue-600" />
            Student
          </span>
        );
    }
  };

  const getStatusBadge = (status?: UserStatus) => {
    switch (status) {
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Suspended
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Active
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="View, search, filter and manage permissions for all registered platform accounts"
      onRefresh={fetchUsers}
      isRefreshing={loading}
    >
      {/* Controls and Filters Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, institution or user ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </form>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="freelancer">Assistants Only</option>
              <option value="admin">Admins Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
              <option value="pending">Pending Only</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Badges Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Found <strong className="text-slate-900">{users.length}</strong> user account{users.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Students ({users.filter((u) => u.role === 'student').length})
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Assistants ({users.filter((u) => u.role === 'freelancer').length})
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Admins ({users.filter((u) => u.role === 'admin').length})
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Institution / Degree</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading users database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No users matching the selected filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.profile_photo ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                          }
                          alt={u.full_name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <NavLink
                            to={`/admin/users/${u.id}`}
                            className="font-bold text-slate-900 hover:text-purple-600 transition-colors block truncate max-w-[180px]"
                          >
                            {u.full_name}
                          </NavLink>
                          <span className="text-[10px] text-slate-400 font-mono block">{u.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Academic info */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-800 truncate">
                          {u.institution || 'Independent Student'}
                        </p>
                        {u.academic_degree && (
                          <p className="text-[11px] text-slate-500 truncate">{u.academic_degree}</p>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(u.status)}</td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <NavLink
                          to={`/admin/users/${u.id}`}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                        >
                          View 360°
                        </NavLink>

                        {/* Status Toggle Button */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewStatusValue(u.status === 'suspended' ? 'active' : 'suspended');
                            setActionModal('status');
                          }}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            u.status === 'suspended'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title={u.status === 'suspended' ? 'Reactivate User' : 'Suspend User'}
                        >
                          {u.status === 'suspended' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>

                        {/* Role Change Button */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRoleValue(u.role);
                            setActionModal('role');
                          }}
                          className="p-1.5 rounded-lg border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 transition-colors"
                          title="Change Role"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal: Status Change */}
      {actionModal === 'status' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {newStatusValue === 'suspended' ? 'Suspend User Account' : 'Reactivate User Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You are about to change the access status for <strong>{selectedUser.full_name}</strong> ({selectedUser.email}).
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Account Status</label>
              <select
                value={newStatusValue}
                onChange={(e) => setNewStatusValue(e.target.value as UserStatus)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2"
              >
                <option value="active">Active (Full access)</option>
                <option value="suspended">Suspended (Blocked from logging in & submitting)</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal: Role Change */}
      {actionModal === 'role' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Change User Platform Role</h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifying the role for <strong>{selectedUser.full_name}</strong> will alter their permissions and workspace views.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">Assign Role</label>
              <select
                value={newRoleValue}
                onChange={(e) => setNewRoleValue(e.target.value as UserRole)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2"
              >
                <option value="student">🎓 Student (Project Posting & Review)</option>
                <option value="freelancer">💼 Academic Assistant (Proposal & Work Delivery)</option>
                <option value="admin">🛡️ Platform Administrator (Root Control)</option>
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
