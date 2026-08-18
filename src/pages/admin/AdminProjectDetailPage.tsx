import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { projectService } from '../../services/supabase/projectService';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  FolderKanban,
  FileText,
  PackageCheck,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  UserCheck,
  User,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { Project, Proposal, Delivery, ProjectFile, ProjectStatus, Profile } from '../../types';

export const AdminProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [assistants, setAssistants] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'deliveries' | 'files'>('overview');

  // Actions
  const [newStatus, setNewStatus] = useState<ProjectStatus>('Submitted');
  const [statusNote, setStatusNote] = useState('');
  const [selectedAssistantId, setSelectedAssistantId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProjectData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [proj, allProposals, allDeliveries, allAssistants] = await Promise.all([
        projectService.getProjectById(id),
        adminService.getAllProposals(),
        adminService.getAllDeliveries(),
        adminService.getAllUsers({ role: 'freelancer' }),
      ]);

      setProject(proj || null);
      if (proj) setNewStatus(proj.status);
      setProposals(allProposals.filter((p) => p.project_id === id));
      setDeliveries(allDeliveries.filter((d) => d.project_id === id));
      setAssistants(allAssistants);
    } catch (err) {
      console.error('Error fetching project detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!project) return;
    setIsUpdating(true);
    try {
      await adminService.updateProjectStatus(project.id, newStatus, statusNote, currentAdmin);
      await fetchProjectData();
      setStatusNote('');
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignAssistant = async () => {
    if (!project || !selectedAssistantId) return;
    const ast = assistants.find((a) => a.id === selectedAssistantId);
    if (!ast) return;

    setIsUpdating(true);
    try {
      await adminService.assignAssistant(project.id, ast.id, ast.full_name, currentAdmin);
      await fetchProjectData();
    } catch (err) {
      console.error('Error assigning assistant:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInterveneDelivery = async (deliveryId: string, action: 'approve' | 'request_revision') => {
    setIsUpdating(true);
    try {
      await adminService.interveneDelivery(deliveryId, action, 'Administrative intervention action applied.', currentAdmin);
      await fetchProjectData();
    } catch (err) {
      console.error('Error intervening delivery:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Project Intelligence" subtitle="Loading project...">
        <div className="p-12 text-center text-slate-400">Loading project details and proposals...</div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout title="Project Not Found" subtitle="Requested project does not exist">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <p className="text-sm text-slate-600">The project with ID "{id}" was not found in the database.</p>
          <NavLink
            to="/admin/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Projects Hub</span>
          </NavLink>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Project: ${project.title}`}
      subtitle={`Comprehensive project specifications, requirements, proposals & work delivery control`}
      onRefresh={fetchProjectData}
      isRefreshing={loading}
    >
      {/* Back button */}
      <div>
        <NavLink
          to="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </NavLink>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                {project.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {project.status}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                Priority: {project.priority}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">{project.title}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Project ID: {project.id}</p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Budget</span>
              <span className="text-sm font-bold text-slate-900">PKR {(project.budget || 0).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Deadline</span>
              <span className="text-sm font-bold text-slate-900">{project.deadline}</span>
            </div>
          </div>
        </div>

        {/* Student & Assigned Assistant Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Student */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase block">Project Author (Student)</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{project.student_name || 'Student'}</p>
              <span className="text-xs text-slate-500 font-mono">{project.student_id}</span>
            </div>
            <NavLink
              to={`/admin/users/${project.student_id}`}
              className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 shadow-xs"
            >
              Student Profile
            </NavLink>
          </div>

          {/* Assigned Assistant */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Assigned Assistant</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {project.assigned_freelancer_name || project.assigned_agent || 'Not yet assigned'}
              </p>
              <span className="text-xs text-slate-500">
                {project.assigned_freelancer_id ? `ID: ${project.assigned_freelancer_id}` : 'Open for proposals'}
              </span>
            </div>
            {project.assigned_freelancer_id && (
              <NavLink
                to={`/admin/users/${project.assigned_freelancer_id}`}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 shadow-xs"
              >
                Assistant Profile
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Description & Specs
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'proposals' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Submitted Proposals ({proposals.length})
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'deliveries' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Deliveries & Outputs ({deliveries.length})
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'files' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Project Attachments ({project.files?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Project Requirements & Scope</h3>
            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{project.description}</p>

            {project.required_skills && project.required_skills.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-2">Required Skills / Technologies</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.required_skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Control Panel Box */}
          <div className="space-y-5">
            {/* Status Update Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin Status Override</span>
              </h4>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
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

              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Audit note explaining the change..."
                rows={2}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />

              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Apply Status Override'}
              </button>
            </div>

            {/* Direct Assign Assistant Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Direct Assistant Assignment</span>
              </h4>
              <select
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              >
                <option value="">-- Choose Assistant --</option>
                {assistants.map((ast) => (
                  <option key={ast.id} value={ast.id}>
                    {ast.full_name} ({ast.academic_degree || 'Expert'})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssignAssistant}
                disabled={!selectedAssistantId || isUpdating}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Assigning...' : 'Assign & Notify Parties'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'proposals' && (
        <div className="space-y-3">
          {proposals.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No assistant proposals submitted yet for this project.
            </div>
          ) : (
            proposals.map((prop) => (
              <div key={prop.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        prop.freelancer_photo ||
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={prop.freelancer_name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <NavLink
                        to={`/admin/users/${prop.freelancer_id}`}
                        className="font-bold text-xs text-slate-900 hover:text-purple-600 block"
                      >
                        {prop.freelancer_name}
                      </NavLink>
                      <span className="text-[10px] text-slate-400">ID: {prop.freelancer_id}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      prop.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prop.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {prop.cover_letter}
                </p>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <span>Proposed Price: <strong className="text-slate-900">PKR {prop.proposed_price.toLocaleString()}</strong></span>
                    <span>Delivery: <strong className="text-slate-900">{prop.estimated_days} days</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Submitted on {new Date(prop.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          {deliveries.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No delivery submissions uploaded yet by the assigned assistant.
            </div>
          ) : (
            deliveries.map((del) => (
              <div key={del.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Work Delivery from {del.freelancer_name}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Submitted on {new Date(del.created_at).toLocaleString()}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    {del.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                  <p className="font-semibold text-slate-900 mb-1">Delivery Message:</p>
                  <p className="text-slate-700">{del.delivery_message}</p>
                </div>

                {/* Files */}
                {del.files && del.files.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Deliverable Files:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {del.files.map((f) => (
                        <a
                          key={f.id}
                          href={f.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                            <span className="truncate">{f.file_name}</span>
                          </div>
                          <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Intervention Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleInterveneDelivery(del.id, 'request_revision')}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-colors"
                  >
                    Request Revision (Admin)
                  </button>
                  <button
                    onClick={() => handleInterveneDelivery(del.id, 'approve')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    Accept & Mark Completed
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Project Requirements & Specification Files</h3>
          {(!project.files || project.files.length === 0) ? (
            <p className="text-xs text-slate-500">No attachments were uploaded with the initial submission.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {project.files.map((file) => (
                <div key={file.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{file.file_name}</p>
                      <span className="text-[10px] text-slate-400">
                        {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'Attachment'} • Uploaded by {file.uploaded_by}
                      </span>
                    </div>
                  </div>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};
