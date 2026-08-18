import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/supabase/authService';
import { User, Phone, School, BookOpen, Lock, Save, Camera, Upload, Trash2, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [academicDegree, setAcademicDegree] = useState(user?.academic_degree || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Maximum image size allowed is 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    showToast('info', 'Uploading Photo', 'Uploading your photo to Supabase storage...');

    const { url, error } = await authService.uploadProfilePhoto(user?.id || 'avatar', file);

    setIsUploadingPhoto(false);

    if (error || !url) {
      showToast('error', 'Upload Failed', error || 'Failed to upload photo.');
      return;
    }

    setProfilePhoto(url);

    // Auto-update user profile in background
    const updateRes = await updateProfile({
      full_name: fullName,
      phone,
      institution,
      academic_degree: academicDegree,
      profile_photo: url,
    });

    if (updateRes.success) {
      showToast('success', 'Photo Updated', 'Your profile photo has been saved to your account.');
    } else {
      showToast('success', 'Photo Uploaded', 'Photo ready. Click "Save Profile Changes" to finalize.');
    }
  };

  const handleRemovePhoto = async () => {
    setProfilePhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    await updateProfile({
      profile_photo: '',
    });
    showToast('info', 'Photo Removed', 'Profile photo cleared.');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const res = await updateProfile({
      full_name: fullName,
      phone,
      institution,
      academic_degree: academicDegree,
      profile_photo: profilePhoto,
    });

    setIsUpdating(false);

    if (res.success) {
      showToast('success', 'Profile Updated', 'Your profile details have been saved.');
    } else {
      showToast('error', 'Update Failed', res.error || 'Could not update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setPasswordError('');

    if (!newPassword.trim()) {
      setPasswordError('Please enter a new password.');
      showToast('error', 'Password Required', 'Please enter a new password.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      showToast('error', 'Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      showToast('error', 'Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    const { success, error } = await authService.updatePassword(newPassword.trim());
    setIsUpdatingPassword(false);

    if (success) {
      showToast('success', 'Password Updated', 'Your account password has been updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } else {
      setPasswordError(error || 'Failed to update password.');
      showToast('error', 'Update Failed', error || 'Failed to update password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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
          title="Profile & Account Settings"
          subtitle="Manage your personal information, university details, and password."
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <ToastContainer toasts={toasts} onRemove={removeToast} />

          {/* User Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group shrink-0 cursor-pointer"
              title="Click to upload profile photo"
            >
              <img
                src={profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-md group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-slate-900/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 mb-0.5" />
                <span className="text-[10px] font-bold">Change</span>
              </div>
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center text-white">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
                <Badge variant="role" role={user?.role} />
              </div>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <p className="text-xs font-semibold text-blue-600">{institution || 'Academic Institute'}</p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="border-b border-slate-100 pb-4 text-center">
              <h3 className="text-base font-bold text-slate-900">Personal & Academic Details</h3>
              <p className="text-xs text-slate-500">Update your personal and academic details</p>
            </div>

            {/* Profile Photo Upload Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Profile Photo</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-white flex items-center justify-center">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <p className="text-xs font-bold text-slate-800">Upload profile image</p>
                  <p className="text-[11px] text-slate-500">
                    Upload from your laptop, computer, or mobile device. Recommended PNG, JPG or WEBP (Max 5MB).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploadingPhoto}
                    icon={<Upload className="w-3.5 h-3.5" />}
                  >
                    Upload Photo
                  </Button>
                  {profilePhoto && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      title="Remove custom photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">University / College</label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Stanford University"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Degree / Specialization</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={academicDegree}
                    onChange={(e) => setAcademicDegree(e.target.value)}
                    placeholder="B.S. Computer Science"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUpdating}
                icon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>

          {/* Change Password Card */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4"
          >
            <div className="border-b border-slate-100 pb-3 text-center">
              <h3 className="text-base font-bold text-slate-900">Update or Change Password</h3>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                {/* New Password */}
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  isLoading={isUpdatingPassword}
                  className="shrink-0 mt-2 sm:mt-0"
                >
                  Update Password
                </Button>
              </div>

              {/* Password Error Message */}
              {passwordError && (
                <div className="flex items-center gap-1.5 mt-2.5 text-xs text-rose-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};