import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  Users,
  Shield,
  Layers,
  DollarSign,
  Briefcase,
  FileText,
  Search,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onCloseMobile }) => {
  const { user, logout,  } = useAuth();
  const navigate = useNavigate();

  // const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const role = e.target.value as UserRole;
  //   switchDemoRole(role);
  //   if (role === 'student') navigate('/dashboard');
  //   else if (role === 'freelancer') navigate('/freelancer');
  //   else if (role === 'admin') navigate('/admin');
  // };

  const navItems = [
    {
      label: 'Dashboard',
      path: user?.role === 'student' ? '/dashboard' : user?.role === 'freelancer' ? '/freelancer' : '/admin',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['student', 'freelancer', 'admin'],
    },
    {
      label: 'My Projects',
      path: '/projects',
      icon: <FolderKanban className="w-5 h-5" />,
      allowedRoles: ['student'],
    },
    {
      label: 'Submit Project',
      path: '/projects/new',
      icon: <PlusCircle className="w-5 h-5" />,
      allowedRoles: ['student'],
    },
    // Assistant Nav Items
    {
      label: 'Browse Projects',
      path: '/freelancer/projects',
      icon: <Search className="w-5 h-5" />,
      allowedRoles: ['freelancer'],
    },
    {
      label: 'My Proposals',
      path: '/freelancer/proposals',
      icon: <FileText className="w-5 h-5" />,
      allowedRoles: ['freelancer'],
    },
    {
      label: 'Active Projects',
      path: '/freelancer/active-projects',
      icon: <Briefcase className="w-5 h-5" />,
      allowedRoles: ['freelancer'],
    },
    {
      label: 'Earnings',
      path: '/freelancer/earnings',
      icon: <DollarSign className="w-5 h-5" />,
      allowedRoles: ['freelancer'],
    },
    // Shared Footer Items
    {
      label: 'My Profile',
      path: '/profile',
      icon: <User className="w-5 h-5" />,
      allowedRoles: ['student', 'freelancer', 'admin'],
    },
    {
      label: 'System Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      allowedRoles: ['student', 'freelancer', 'admin'],
    },
  ];

  return (
    <aside
      className={`w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-full min-h-screen ${className}`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">
                Student Assistant
              </span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase block">
                Workspace
              </span>
            </div>
          </NavLink>
        </div>

        {/* Demo Role Switcher Header Box */}
        {/* <div className="px-4 py-3 m-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1 flex items-center justify-between">
            <span>Active Role</span>
            <Sparkles className="w-3 h-3 text-blue-600" />
          </label>
          <select
            value={user?.role || 'student'}
            onChange={handleRoleChange}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="student">🎓 Student View</option>
            <option value="freelancer">💼 Freelancer / Agent View</option>
            <option value="admin">🛡️ Administrator View</option>
          </select>
        </div> */}

        {/* Navigation Section */}
                <div className="p-3">
          <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems
              .filter((item) => item.allowedRoles.includes(user?.role || 'student'))
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
          </nav>
        </div>

        {/* AI Agent Showcase Link */}
        {/* <div className="px-4 py-3 mx-3 my-2 bg-gradient-to-br from-blue-50 to-indigo-50/80 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">AI Agents Active</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            6 Specialized Agents available for immediate task assignment.
          </p>
        </div> */}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={user?.full_name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.full_name || 'Student User'}
              </p>
              <p className="text-[10px] text-slate-500 capitalize truncate flex items-center gap-1">
                {user?.role === 'admin' ? (
                  <Shield className="w-2.5 h-2.5 text-purple-600 inline" />
                ) : user?.role === 'freelancer' ? (
                  <Users className="w-2.5 h-2.5 text-emerald-600 inline" />
                ) : (
                  <Layers className="w-2.5 h-2.5 text-blue-600 inline" />
                )}
                {user?.role || 'student'} Account
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};