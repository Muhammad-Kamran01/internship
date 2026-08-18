import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Shield,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  Building,
  Calendar,
  FolderKanban,
  FileText,
  PackageCheck,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Profile, Project, Proposal, Delivery, EarningRecord, UserStatus } from '../../types';

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    user: Profile | null;
    projects: Project[];
    proposals: Proposal[];
    deliveries: Delivery[];
    earnings: EarningRecord[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'proposals' | 'deliveries' | 'earnings'>('projects');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchUser = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminService.getUserDetails(id);
      setUserData(data);
      if (data.user?.role === 'freelancer' && data.projects.length === 0 && data.proposals.length > 0) {
        setActiveTab('proposals');
      }
    } catch (err) {
      console.error('Error loading user detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!userData?.user) return;
    setIsUpdatingStatus(true);
    try {
      const nextStatus: UserStatus = userData.user.status === 'suspended' ? 'active' : 'suspended';
      await adminService.updateUserStatus(userData.user.id, nextStatus, currentAdmin);
      await fetchUser();
    } catch (err) {
      console.error('Error toggling status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="User 360° Profile" subtitle="Loading user intelligence...">
        <div className="p-12 text-center text-slate-400">Loading user profile and history...</div>
      </AdminLayout>
    );
  }

  if (!userData?.user) {
    return (
      <AdminLayout title="User Not Found" subtitle="Requested user does not exist">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <p className="text-sm text-slate-600">The user with ID "{id}" was not found in the database.</p>
          <NavLink
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Users Directory</span>
          </NavLink>
        </div>
      </AdminLayout>
    );
  }

  const u = userData.user;

  return (
    <AdminLayout
      title={`User 360°: ${u.full_name}`}
      subtitle={`Complete audit trail and history for ${u.email}`}
      onRefresh={fetchUser}
      isRefreshing={loading}
    >
      {/* Back Button */}
      <div>
        <NavLink
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Users</span>
        </NavLink>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src={
                u.profile_photo ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
              }
              alt={u.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{u.full_name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : u.role === 'freelancer'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {u.role}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    u.status === 'suspended'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {u.status === 'suspended' ? 'Suspended' : 'Active Account'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">ID: {u.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                u.status === 'suspended'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {u.status === 'suspended' ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Reactivate Account</span>
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4" />
                  <span>Suspend Account</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Email Address</span>
              <span className="font-medium text-slate-800">{u.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Contact Phone</span>
              <span className="font-medium text-slate-800">{u.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Institution</span>
              <span className="font-medium text-slate-800">{u.institution || 'Independent'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Joined Platform</span>
              <span className="font-medium text-slate-800">
                {new Date(u.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'projects'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Projects ({userData.projects.length})
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'proposals'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Proposals ({userData.proposals.length})
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'deliveries'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Deliveries ({userData.deliveries.length})
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'earnings'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Earnings History ({userData.earnings.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {userData.projects.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No project records found for this user.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userData.projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.title}</td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 text-slate-500">{p.deadline}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">PKR {(p.budget || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <NavLink
                          to={`/admin/projects/${p.id}`}
                          className="text-purple-600 hover:text-purple-800 font-bold"
                        >
                          Inspect →
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'proposals' && (
        <div className="space-y-3">
          {userData.proposals.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No proposal submissions recorded.
            </div>
          ) : (
            userData.proposals.map((prop) => (
              <div key={prop.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{prop.project_title || 'Project Proposal'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {prop.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{prop.cover_letter}</p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
                  <span>Price: PKR {prop.proposed_price.toLocaleString()}</span>
                  <span>Timeline: {prop.estimated_days} days</span>
                  <span className="text-slate-400 font-normal text-[11px] ml-auto">
                    {new Date(prop.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'deliveries' && (
        <div className="space-y-3">
          {userData.deliveries.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No work delivery submissions found.
            </div>
          ) : (
            userData.deliveries.map((del) => (
              <div key={del.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{del.project_title || 'Project Delivery'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    {del.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{del.delivery_message}</p>
                {del.revision_notes && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Revision Notes: {del.revision_notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {userData.earnings.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No earnings or payout records.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userData.earnings.map((e) => (
                  <tr key={e.id}>
                    <td className="py-3 px-4 font-bold text-slate-800">{e.project_title}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">PKR {e.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(e.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  );
};
