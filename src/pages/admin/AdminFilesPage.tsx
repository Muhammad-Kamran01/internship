import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import {
  FileText,
  Search,
  Download,
  FolderKanban,
  FileCode,
  FileArchive,
  Image,
  ExternalLink,
  Calendar,
  Layers,
} from 'lucide-react';
import { ProjectFile } from '../../types';

export const AdminFilesPage: React.FC = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllProjectFiles({
        search,
      });
      setFiles(data);
    } catch (err) {
      console.error('Error loading central files repository:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) {
      return <FileArchive className="w-5 h-5 text-amber-500" />;
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || '')) {
      return <Image className="w-5 h-5 text-emerald-500" />;
    }
    if (['py', 'js', 'ts', 'java', 'cpp', 'html', 'css'].includes(ext || '')) {
      return <FileCode className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-purple-600" />;
  };

  const filteredFiles = files.filter((f) => {
    if (typeFilter === 'requirements' && f.uploaded_by !== 'Student') return false;
    if (typeFilter === 'deliveries' && f.uploaded_by === 'Student') return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.file_name.toLowerCase().includes(q) ||
      (f.project_title && f.project_title.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout
      title="Platform Files Repository"
      subtitle="Central archive of all uploaded student requirements, academic briefs, code attachments & assistant deliverable archives"
      onRefresh={loadFiles}
      isRefreshing={loading}
    >
      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name or project title..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-auto text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All File Types ({files.length})</option>
            <option value="requirements">Student Briefs & Requirements</option>
            <option value="deliveries">Assistant Final Deliverables</option>
          </select>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Linked Project</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Date Uploaded</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading platform files...
                  </td>
                </tr>
              ) : filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No files found matching the search query.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* File Name */}
                    <td className="py-3.5 px-4 max-w-[260px]">
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                          {getFileIcon(file.file_name)}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 truncate block">{file.file_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{file.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Linked Project */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      {file.project_id ? (
                        <NavLink
                          to={`/admin/projects/${file.project_id}`}
                          className="font-semibold text-slate-800 hover:text-purple-600 truncate block"
                        >
                          {file.project_title || 'Project Specs'}
                        </NavLink>
                      ) : (
                        <span className="text-slate-400">Unlinked</span>
                      )}
                    </td>

                    {/* Uploaded By */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          file.uploaded_by === 'Student'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {file.uploaded_by || 'Platform User'}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'N/A'}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>

                    {/* Download button */}
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
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
