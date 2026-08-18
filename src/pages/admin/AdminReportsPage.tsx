import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FolderKanban,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Download,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const overview = await adminService.getDashboardOverview();
      setData(overview);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const exportSummaryJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-assistant-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Platform Reports & Analytics"
      subtitle="Detailed macro indicators, transaction volume, project turnaround efficiency and marketplace distribution"
      onRefresh={loadReports}
      isRefreshing={loading}
    >
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Platform Performance Summary</h3>
          <p className="text-xs text-slate-500">Real-time aggregated indicators across all database records</p>
        </div>

        <button
          onClick={exportSummaryJSON}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics JSON</span>
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Gross Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            PKR {(data?.totalPlatformVolume || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            Completed project transaction value
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Pipeline In-Flight</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            PKR {(data?.pendingVolume || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold block mt-1">
            Active in-progress & assigned projects
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.totalProjects > 0
              ? `${Math.round(((data.completedProjects || 0) / data.totalProjects) * 100)}%`
              : '0%'}
          </p>
          <span className="text-[11px] text-purple-600 font-semibold block mt-1">
            {data?.completedProjects || 0} of {data?.totalProjects || 0} finished
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Marketplace Liquidity</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.totalAssistants > 0
              ? `${((data.totalStudents || 0) / data.totalAssistants).toFixed(1)}:1`
              : '0:0'}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold block mt-1">
            Student to Assistant ratio
          </span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Project Status Distribution</h3>
          <div className="space-y-3">
            {data?.statusCounts &&
              Object.entries(data.statusCounts).map(([status, count]: any) => (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{status}</span>
                    <span className="font-bold text-slate-900">
                      {count} ({Math.round(((count as number) / (data.totalProjects || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${((count as number) / (data.totalProjects || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Academic Category Breakdown</h3>
          <div className="space-y-3">
            {data?.categoryCounts &&
              Object.entries(data.categoryCounts).map(([category, count]: any) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[200px]">{category}</span>
                    <span className="font-bold text-slate-900">
                      {count} project{count > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{
                        width: `${((count as number) / (data.totalProjects || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
