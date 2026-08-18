import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Globe,
  DollarSign,
  Mail,
  FileText,
  Lock,
} from 'lucide-react';
import { PlatformSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PlatformSettings>({
    platform_name: 'Student Assistant',
    currency: 'PKR',
    require_assistant_approval: true,
    allow_student_registrations: true,
    max_file_size_mb: 50,
    support_email: 'support@studentassistant.com',
    maintenance_mode: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPlatformSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading platform settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updatePlatformSettings(settings, currentAdmin);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Platform Global Settings"
      subtitle="Configure marketplace verification parameters, maximum upload thresholds, system maintenance mode & support contacts"
      onRefresh={loadSettings}
      isRefreshing={loading}
    >
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Platform configuration settings successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Marketplace & Verification Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Marketplace Verification & Governance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Require Assistant Verification</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Newly registered assistants must be reviewed and approved by admin before submitting proposals
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.require_assistant_approval}
                onChange={(e) =>
                  setSettings({ ...settings, require_assistant_approval: e.target.checked })
                }
                className="w-5 h-5 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Open Student Signups</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Allow new students to register and submit academic project requirements
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.allow_student_registrations}
                onChange={(e) =>
                  setSettings({ ...settings, allow_student_registrations: e.target.checked })
                }
                className="w-5 h-5 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Operational & File Upload Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">General Platform Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Platform Brand Title</label>
              <input
                type="text"
                required
                value={settings.platform_name}
                onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Display Currency Code</label>
              <input
                type="text"
                required
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Max Upload Limit (MB)</label>
              <input
                type="number"
                required
                min={5}
                max={500}
                value={settings.max_file_size_mb}
                onChange={(e) => setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) || 50 })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Support Contact Email</label>
              <input
                type="email"
                required
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode Danger Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Maintenance & Service Status</h3>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-900 block">Enable System Maintenance Mode</span>
              <span className="text-[11px] text-amber-700 block mt-0.5">
                Displays maintenance message to regular students and assistants while preserving admin access
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) =>
                setSettings({ ...settings, maintenance_mode: e.target.checked })
              }
              className="w-5 h-5 text-amber-600 rounded-md focus:ring-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Configurations...' : 'Save Platform Settings'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
