import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  Radio,
  Send,
  Bell,
  Users,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { SystemAnnouncement } from '../../types';

export const AdminNotificationsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  // New broadcast form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'students' | 'freelancers'>('all');
  const [priority, setPriority] = useState<'normal' | 'important' | 'critical'>('normal');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsBroadcasting(true);
    try {
      const broadcastTitle = priority === 'urgent' ? `🚨 [URGENT] ${title}` : priority === 'high' ? `⚡ ${title}` : title;
      await adminService.createAnnouncement(
        {
          title: broadcastTitle,
          message,
          target_audience: targetAudience,
        },
        currentAdmin
      );

      setTitle('');
      setMessage('');
      setTargetAudience('all');
      setPriority('normal');
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 4000);
      await loadAnnouncements();
    } catch (err) {
      console.error('Error broadcasting announcement:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Critical Urgent
          </span>
        );
      case 'important':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Important Notice
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Standard Info
          </span>
        );
    }
  };

  const getAudienceBadge = (aud: string) => {
    switch (aud) {
      case 'students':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
            <GraduationCap className="w-3.5 h-3.5" /> Students Only
          </span>
        );
      case 'freelancers':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <Briefcase className="w-3.5 h-3.5" /> Assistants Only
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700">
            <Users className="w-3.5 h-3.5" /> All Platform Users
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="System Broadcasts & Announcements"
      subtitle="Publish real-time announcements, policy updates, maintenance alerts or guidelines across all user dashboards"
      onRefresh={loadAnnouncements}
      isRefreshing={loading}
    >
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System announcement successfully broadcasted across targeted platform accounts!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Radio className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Broadcast New Announcement</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Announcement Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled System Upgrade or Academic Guidelines Update"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white"
                >
                  <option value="all">👥 All Users</option>
                  <option value="students">🎓 Students Only</option>
                  <option value="freelancers">💼 Assistants Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white"
                >
                  <option value="normal">Standard Info</option>
                  <option value="important">Important Notice</option>
                  <option value="critical">🚨 Critical Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type the full message text visible on user dashboards..."
                rows={4}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isBroadcasting || !title.trim() || !message.trim()}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to Portal'}</span>
            </button>
          </form>
        </div>

        {/* Announcement History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Published Announcements History ({announcements.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading broadcasts...</div>
          ) : announcements.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No previous broadcasts recorded on the platform.
            </div>
          ) : (
            <div className="space-y-3.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs text-slate-900">{ann.title}</h4>
                      {getPriorityBadge(ann.priority)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {ann.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <div>{getAudienceBadge(ann.target_audience)}</div>
                    <span className="text-[10px] text-slate-400">
                      Published by Admin ({ann.created_by})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
