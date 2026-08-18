import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  FolderKanban,
  FileText,
  PackageCheck,
  HardDrive,
  Tags,
  BellRing,
  BarChart3,
  ScrollText,
  Sliders,
  UserCheck,
  Shield,
  Sparkles,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../../types';

interface AdminSidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '', onCloseMobile }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    switchDemoRole(role);
    if (role === 'student') navigate('/dashboard');
    else if (role === 'freelancer') navigate('/freelancer');
    else if (role === 'admin') navigate('/admin');
  };

  const navSections = [
    {
      title: 'Command Center',
      items: [
        {
          label: 'Admin Dashboard',
          path: '/admin',
          icon: <LayoutDashboard className="w-4 h-4" />,
          badge: 'Live',
        },
      ],
    },
    {
      title: 'User Management',
      items: [
        {
          label: 'All Users',
          path: '/admin/users',
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: 'Students Directory',
          path: '/admin/students',
          icon: <GraduationCap className="w-4 h-4" />,
        },
        {
          label: 'Assistants & Approvals',
          path: '/admin/assistants',
          icon: <Briefcase className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Projects & Workflows',
      items: [
        {
          label: 'All Projects',
          path: '/admin/projects',
          icon: <FolderKanban className="w-4 h-4" />,
        },
        {
          label: 'Proposals Hub',
          path: '/admin/proposals',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: 'Deliveries & Quality',
          path: '/admin/deliveries',
          icon: <PackageCheck className="w-4 h-4" />,
        },
        {
          label: 'Files Repository',
          path: '/admin/files',
          icon: <HardDrive className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Platform Control',
      items: [
        {
          label: 'Academic Categories',
          path: '/admin/categories',
          icon: <Tags className="w-4 h-4" />,
        },
        {
          label: 'Broadcasts & Alerts',
          path: '/admin/notifications',
          icon: <BellRing className="w-4 h-4" />,
        },
        {
          label: 'Reports & Analytics',
          path: '/admin/reports',
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          label: 'Audit Activity Trail',
          path: '/admin/activity',
          icon: <ScrollText className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          label: 'Platform Settings',
          path: '/admin/settings',
          icon: <Sliders className="w-4 h-4" />,
        },
        {
          label: 'Admin Profile',
          path: '/admin/profile',
          icon: <UserCheck className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside
      id="admin-sidebar"
      className={`w-64 bg-slate-900 text-slate-300 flex flex-col justify-between h-full min-h-screen border-r border-slate-800 ${className}`}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <NavLink to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block">
                Student Assistant
              </span>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                Admin Portal
              </span>
            </div>
          </NavLink>
        </div>

        {/* Demo Role Switcher Header Box */}

        {/* Navigation Sections */}
        <div className="px-3 py-2 space-y-4">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </p>
              <nav className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-purple-600 text-white font-semibold shadow-xs shadow-purple-500/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {'badge' in item && item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Quick Portal Switch Link to Marketplace */}
        <div className="px-3 py-2">
          <NavLink
            to="/freelancer/projects"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span>Public Marketplace</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </NavLink>
        </div>
      </div>

      {/* Admin User Profile Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={
                user?.profile_photo ||
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
              }
              alt={user?.full_name || 'Admin'}
              className="w-8 h-8 rounded-full object-cover border border-purple-500/40 shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Platform Administrator'}
              </p>
              <p className="text-[10px] text-purple-400 flex items-center gap-1 font-medium truncate">
                <Shield className="w-2.5 h-2.5 text-purple-400 inline shrink-0" />
                Root Administrator
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Sign Out"
            id="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
