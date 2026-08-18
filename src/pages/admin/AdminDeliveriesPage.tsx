import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Calendar,
  ExternalLink,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { Delivery, DeliveryStatus } from '../../types';

export const AdminDeliveriesPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllDeliveries({
        status: statusFilter,
        search,
      });
      setDeliveries(data);
    } catch (err) {
      console.error('Error loading deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

  const handleIntervene = async (action: 'approve' | 'request_revision') => {
    if (!selectedDelivery) return;
    setIsProcessing(true);
    try {
      await adminService.interveneDelivery(selectedDelivery.id, action, revisionNotes, currentAdmin);
      await loadDeliveries();
      setSelectedDelivery(null);
      setRevisionNotes('');
    } catch (err) {
      console.error('Error in delivery intervention:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted / Completed
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Revision Requested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <PackageCheck className="w-3 h-3 text-purple-600" />
            Submitted for Review
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Work Deliveries & Quality Control"
      subtitle="Inspect deliverables submitted by academic assistants, verify attached files, handle student disputes & execute quality interventions"
      onRefresh={loadDeliveries}
      isRefreshing={loading}
    >
      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); loadDeliveries(); }} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deliverables by project title, assistant, message keywords..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="Submitted for Review">Submitted for Review</option>
            <option value="Revision Requested">Revision Requested</option>
            <option value="Accepted">Accepted / Completed</option>
          </select>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Loading deliveries stream...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No work delivery submissions matching the selected filters.
          </div>
        ) : (
          deliveries.map((del) => (
            <div
              key={del.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 hover:border-purple-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <NavLink
                      to={`/admin/projects/${del.project_id}`}
                      className="font-bold text-sm text-slate-900 hover:text-purple-600 transition-colors"
                    >
                      {del.project_title || 'Project Delivery'}
                    </NavLink>
                    {getStatusBadge(del.status)}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>
                      Submitted by <strong>{del.freelancer_name}</strong>
                    </span>
                    <span>•</span>
                    <span>Student: {del.student_name || 'Student'}</span>
                    <span>•</span>
                    <span>{new Date(del.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDelivery(del)}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Intervention</span>
                  </button>
                </div>
              </div>

              {/* Message */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Assistant's Submission Note:</p>
                <p className="whitespace-pre-line">{del.delivery_message}</p>
              </div>

              {/* Revision notes if any */}
              {del.revision_notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Active Revision Request:</span>
                  <span>{del.revision_notes}</span>
                </div>
              )}

              {/* Files */}
              {del.files && del.files.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                    Delivered Output Files ({del.files.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {del.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="truncate">{file.file_name}</span>
                        </div>
                        <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Intervention Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Admin Quality Intervention</h3>
            <p className="text-xs text-slate-500">
              Take an administrative decision on the delivery for "<strong>{selectedDelivery.project_title}</strong>".
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Administrative Action Note</label>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Specify requirements or instructions for revision if requesting changes..."
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleIntervene('request_revision')}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-xl disabled:opacity-50"
              >
                Request Revision
              </button>
              <button
                onClick={() => handleIntervene('approve')}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl disabled:opacity-50"
              >
                Approve & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
