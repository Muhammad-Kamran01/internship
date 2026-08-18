import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export const ProfileProgress: React.FC = () => {
  const { user } = useAuth();

  let score = 40; // Base score
  if (user?.full_name) score += 15;
  if (user?.email) score += 15;
  if (user?.phone) score += 10;
  if (user?.institution) score += 10;
  if (user?.academic_degree) score += 10;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md shadow-blue-500/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/20 text-white">
            <UserCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
            Student Profile
          </span>
        </div>
        <span className="text-xs font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full text-white">
          {score}% Complete
        </span>
      </div>

      <p className="text-sm font-semibold mb-1">{user?.full_name}</p>
      <p className="text-xs text-blue-100/90 mb-3">{user?.institution || 'Add University / College details'}</p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-blue-900/40 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-blue-500/30 text-xs">
        <span className="text-blue-100 text-[11px] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Account Verified
        </span>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
        >
          <span>Edit Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
