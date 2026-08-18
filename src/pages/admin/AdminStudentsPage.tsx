import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import {
  GraduationCap,
  Search,
  FolderKanban,
  DollarSign,
  Mail,
  Building,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { Profile, Project } from '../../types';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allProjects] = await Promise.all([
        adminService.getAllUsers({ role: 'student' }),
        adminService.getAllProjects(),
      ]);
      setStudents(allUsers);
      setProjects(allProjects);
    } catch (err) {
      console.error('Error loading students directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.institution && s.institution.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout
      title="Students Directory"
      subtitle="Complete listing of student accounts, submitted projects & spending metrics"
      onRefresh={loadData}
      isRefreshing={loading}
    >
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, university or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 shrink-0">
          Showing <strong className="text-slate-900">{filteredStudents.length}</strong> enrolled students
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading student directory...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No students found matching your criteria.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const studentProjects = projects.filter((p) => p.student_id === student.id);
            const totalSpent = studentProjects
              .filter((p) => p.status === 'Completed')
              .reduce((sum, p) => sum + (p.budget || 0), 0);
            const activeProjectsCount = studentProjects.filter(
              (p) => p.status === 'In Progress' || p.status === 'Assigned' || p.status === 'Review'
            ).length;

            return (
              <div
                key={student.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          student.profile_photo ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                        }
                        alt={student.full_name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <NavLink
                          to={`/admin/users/${student.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-purple-600 transition-colors block"
                        >
                          {student.full_name}
                        </NavLink>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[170px]">
                          {student.email}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.status === 'suspended'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {student.status === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{student.institution || 'Independent Student'}</span>
                    </div>
                    {student.academic_degree && (
                      <div className="flex items-center gap-2 truncate text-slate-500 text-[11px]">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{student.academic_degree}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Projects</span>
                      <span className="font-bold text-slate-900">{studentProjects.length}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50">
                      <span className="text-[10px] text-blue-600 block uppercase font-bold">Active</span>
                      <span className="font-bold text-blue-900">{activeProjectsCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50">
                      <span className="text-[10px] text-emerald-600 block uppercase font-bold">Spent</span>
                      <span className="font-bold text-emerald-900">PKR {totalSpent > 1000 ? `${Math.round(totalSpent / 1000)}k` : totalSpent}</span>
                    </div>
                  </div>

                  <NavLink
                    to={`/admin/users/${student.id}`}
                    className="w-full py-2 text-center block text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                  >
                    View Student Intelligence →
                  </NavLink>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
};
