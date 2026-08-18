import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/supabase/projectService';
import { Notification } from '../../types';
import { Bell, Search, Menu, Check, Sparkles, X, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
  title?: string;
  subtitle?: string;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  title,
  subtitle,
  onOpenHelp,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  useEffect(() => {
    if (user) {
      projectService.getNotifications(user.id).then((data) => {
        setNotifications(data);
      });
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    for (const notif of notifications) {
      if (!notif.is_read) {
        await projectService.markNotificationRead(notif.id);
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {title || `Welcome back, ${user?.full_name?.split(' ')[0] || 'Student'}`}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {subtitle || 'Manage your academic projects with our specialized assistants.'}
            </p>
          </div>
        </div>

        {/* Right: Search & Notifications */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search projects or assistants..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* How It Works Button */}
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
              title="How It Works Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">How It Works</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifPopover(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors ${
                          n.is_read ? 'bg-white' : 'bg-blue-50/50'
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Profile Link */}
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 border-l border-slate-200/80 hover:opacity-80 transition-opacity"
          >
            <img
              src={user?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={user?.full_name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs font-semibold text-slate-800 hidden md:inline">
              {user?.full_name?.split(' ')[0]}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};