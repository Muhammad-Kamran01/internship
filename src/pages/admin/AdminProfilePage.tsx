import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  Camera,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '@/src/components/common/Button';

export const AdminProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'System Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@studentassistant.com');
  const [phone, setPhone] = useState(user?.phone || '+92 300 1234567');
  const [photoUrl, setPhotoUrl] = useState(
    user?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({
          full_name: fullName,
          phone,
          profile_photo: photoUrl,
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving admin profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Admin Account Profile"
      subtitle="Manage your administrative credentials, contact details, security credentials and account avatar"
    >
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Admin profile details successfully saved and updated!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <img
              src={photoUrl}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/20 shadow-md"
            />
            <div className="absolute bottom-0 right-0 p-1.5 bg-purple-600 text-white rounded-full shadow-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">{fullName}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider block mt-1">
              Super Administrator
            </span>
            <p className="text-xs text-slate-400 font-mono mt-1">Role: root_admin</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{phone}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs lg:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Edit Administrative Account Information
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Admin Email Address</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Managed via Supabase Auth</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Profile Photo Upload Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Profile Photo</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-white flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <p className="text-xs font-bold text-slate-800">Upload profile image</p>
                  <p className="text-[11px] text-slate-500">
                    Upload from your laptop, computer, or mobile device. Recommended PNG, JPG or WEBP (Max 5MB).
                  </p>
                </div>

                <label className="w-full sm:w-auto">
                  <span className="inline-flex w-full sm:w-auto justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                    Choose Image
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
