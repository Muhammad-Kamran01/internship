import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { Button } from '../components/common/Button';
import { isSupabaseConfigured } from '../services/supabase/client';
import { Database, ShieldCheck, Bell, Sparkles, Copy, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [agentProgressUpdates, setAgentProgressUpdates] = useState(true);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lgtimlxilrzvgpfmkoin.supabase.co';

  const schemaPreview = `-- Supabase PostgreSQL Database Schema for Student Assistant
-- Tables: profiles, projects, project_files, notifications, activity_logs, project_comments

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  phone TEXT,
  institution TEXT,
  academic_degree TEXT,
  profile_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
`;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaPreview);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar className="hidden lg:flex shrink-0 border-r border-slate-200/80 sticky top-0 h-screen" />

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/50 backdrop-blur-xs">
          <Sidebar
            className="w-72 h-full shadow-2xl"
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          title="Settings"
          subtitle="Configure your system preferences"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">

          {/* Notifications Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" /> Notification Preferences
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900">Email Progress Alerts</p>
                  <p className="text-slate-500">Receive email when assistants update project status</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900">Live Agent Activity Log</p>
                  <p className="text-slate-500">Show real-time assistant step transitions on dashboard</p>
                </div>
                <input
                  type="checkbox"
                  checked={agentProgressUpdates}
                  onChange={(e) => setAgentProgressUpdates(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};