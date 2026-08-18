import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  DollarSign,
  Calendar,
  Eye,
} from 'lucide-react';
import { Proposal, ProposalStatus } from '../../types';

export const AdminProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllProposals({
        status: statusFilter,
        search,
      });
      setProposals(data);
    } catch (err) {
      console.error('Error loading proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProposals();
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Proposals Hub"
      subtitle="Monitor academic proposals submitted by assistants, proposed rates, delivery turnaround & conversion rates"
      onRefresh={loadProposals}
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
            placeholder="Search proposals by project title, assistant name or letter text..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Proposal Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Project & Student</th>
                <th className="py-3 px-4">Assistant</th>
                <th className="py-3 px-4">Proposed Price</th>
                <th className="py-3 px-4">Turnaround</th>
                <th className="py-3 px-4">Cover Letter Preview</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading proposal records...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No proposals found matching the selected filters.
                  </td>
                </tr>
              ) : (
                proposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Project */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <NavLink
                        to={`/admin/projects/${prop.project_id}`}
                        className="font-bold text-slate-900 hover:text-purple-600 truncate block"
                      >
                        {prop.project_title || 'Academic Project'}
                      </NavLink>
                      <span className="text-[10px] text-slate-400">
                        Author: {prop.student_name || 'Student'}
                      </span>
                    </td>

                    {/* Assistant */}
                    <td className="py-3.5 px-4">
                      <NavLink
                        to={`/admin/users/${prop.freelancer_id}`}
                        className="font-semibold text-slate-800 hover:text-purple-600 truncate block max-w-[150px]"
                      >
                        {prop.freelancer_name}
                      </NavLink>
                      <span className="text-[10px] text-slate-400">
                        {new Date(prop.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Proposed Price */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        PKR {prop.proposed_price.toLocaleString()}
                      </span>
                      {prop.project_budget && (
                        <span className="text-[10px] text-slate-400">
                          (Budget: PKR {prop.project_budget.toLocaleString()})
                        </span>
                      )}
                    </td>

                    {/* Turnaround */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {prop.estimated_days} days
                    </td>

                    {/* Letter Preview */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="text-slate-600 truncate">{prop.cover_letter}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(prop.status)}</td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedProposal(prop)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition-colors"
                        title="View Full Cover Letter"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Proposal Inspection</h3>
                <p className="text-xs text-slate-500">
                  For project: <strong>{selectedProposal.project_title}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Assistant</span>
                <span className="text-slate-900">{selectedProposal.freelancer_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Price</span>
                <span className="text-slate-900">PKR {selectedProposal.proposed_price.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Timeline</span>
                <span className="text-slate-900">{selectedProposal.estimated_days} days</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">Cover Letter & Pitch:</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto custom-scrollbar">
                {selectedProposal.cover_letter}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <NavLink
                to={`/admin/projects/${selectedProposal.project_id}`}
                className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
              >
                <span>Go to Project Page</span>
                <ExternalLink className="w-3 h-3" />
              </NavLink>
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
