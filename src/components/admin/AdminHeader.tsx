import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Bell,
  Search,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { adminService } from '../../services/supabase/adminService';
import { Notification } from '../../types';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onRefresh,
  isRefreshing = false,
}) => {
  const { user, logout, isSupabaseActive } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const auditLogs = await adminService.getAuditLogs();
        const formattedNotifs: Notification[] = auditLogs.slice(0, 5).map((log) => ({
          id: log.id,
          user_id: log.user_id || 'usr-admin',
          title: log.action,
          message: log.details || 'System activity logged',
          is_read: false,
          type: 'system',
          created_at: log.created_at,
        }));
        setNotifications(formattedNotifs);
        setUnreadCount(formattedNotifs.length);
      } catch {
        // empty
      }
    }
    loadNotifs();
  }, []);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
              <Shield className="w-3 h-3 text-purple-600" />
              Admin
            </span>
          </div>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, users, proposals..."
            className="w-56 lg:w-72 pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        </form>

        {/* Database Status Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
          <div className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          <span>{isSupabaseActive ? 'Supabase RLS Active' : 'Verified Local DB'}</span>
        </div>

        {/* Manual Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Refresh Data"
            id="admin-header-refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
            id="admin-header-notifs-btn"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-900">Admin Platform Alerts</span>
                </div>
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-[11px] text-purple-600 hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mt-2 custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No recent administrative alerts.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-lg transition-colors">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2.5 mt-2 border-t border-slate-100 text-center">
                <NavLink
                  to="/admin/activity"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 block"
                >
                  View Complete Audit Trail →
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Admin User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
            id="admin-header-profile-btn"
          >
            <img
              src={
                user?.profile_photo ||
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
              }
              alt={user?.full_name || 'Admin'}
              className="w-7 h-7 rounded-full object-cover border border-purple-400/60"
            />
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[120px] truncate">
              {user?.full_name?.split(' ')[0] || 'Admin'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.full_name || 'Platform Administrator'}
                </p>
                <p className="text-[11px] text-purple-600 font-medium truncate">{user?.email}</p>
              </div>

              <NavLink
                to="/admin/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Profile</span>
              </NavLink>

              <NavLink
                to="/admin/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Platform Settings</span>
              </NavLink>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
