import { supabase, isSupabaseConfigured } from './client';
import { Profile, UserRole } from '../../types';

const LOCAL_STORAGE_USER_KEY = 'student_assistant_user_session';
const LOCAL_STORAGE_PROFILES_KEY = 'student_assistant_profiles';

interface StoredLocalProfile extends Profile {
  password?: string;
}

// Helper to load local profiles registry
function getLocalProfiles(): Record<string, StoredLocalProfile> {
  const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return {};
}

export const authService = {
  /**
   * Get current user session from Supabase or Local Storage fallback
   */
  async getCurrentSession(): Promise<{ user: Profile | null; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          // Fetch profile from database
          const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile && !profError) {
            return { user: profile as Profile, error: null };
          }

          // Return constructed profile if database profile query failed
          return {
            user: {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as UserRole) || 'student',
              phone: session.user.user_metadata?.phone || '',
              institution: session.user.user_metadata?.institution || '',
              academic_degree: session.user.user_metadata?.academic_degree || '',
              created_at: session.user.created_at,
            },
            error: null,
          };
        }
      } catch (err: unknown) {
        console.warn('Supabase session fetch warning, using local session:', err);
      }
    }

    // Fallback: local session check
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      try {
        return { user: JSON.parse(stored), error: null };
      } catch {
        // empty
      }
    }

    return { user: null, error: null };
  },

  /**
   * Register a new user
   */
  async register(
    fullName: string,
    email: string,
    password: string,
    role: UserRole = 'student',
    phone?: string,
    institution?: string,
    academicDegree?: string
  ): Promise<{ user: Profile | null; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              phone: phone || '',
              institution: institution || '',
              academic_degree: academicDegree || '',
            },
          },
        });

        if (error) {
          return { user: null, error: error.message };
        }

        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            full_name: fullName,
            email: cleanEmail,
            phone: phone || '',
            role,
            created_at: new Date().toISOString(),
            institution: institution || '',
            academic_degree: academicDegree || '',
          };

          // Explicitly insert row into public.profiles table
          const { error: dbError } = await supabase.from('profiles').upsert([newProfile]);
          if (dbError) {
            console.error('Supabase profile insertion error:', dbError.message);
          }

          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));

          // Also update local profile store
          const profiles = getLocalProfiles();
          profiles[cleanEmail] = { ...newProfile, password };
          localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));

          return { user: newProfile, error: null };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed via Supabase.';
        return { user: null, error: message };
      }
    }

    // Local Storage Mode
    const profiles = getLocalProfiles();
    if (profiles[cleanEmail]) {
      return { user: null, error: 'An account with this email address already exists.' };
    }

    const newProfile: StoredLocalProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      full_name: fullName,
      email: cleanEmail,
      phone: phone || '',
      role,
      created_at: new Date().toISOString(),
      institution: institution || '',
      academic_degree: academicDegree || '',
      password,
    };

    profiles[cleanEmail] = newProfile;
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));

    // Remove password before saving active session
    const { password: _, ...profileSession } = newProfile;
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profileSession));

    return { user: profileSession, error: null };
  },

  /**
   * Login user with Email & Password
   */
  async login(
    email: string,
    password: string,
    selectedRole?: UserRole
  ): Promise<{ user: Profile | null; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { user: null, error: error.message || 'Invalid email or password.' };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const activeUser: Profile = profile || {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            email: data.user.email || cleanEmail,
            role: selectedRole || data.user.user_metadata?.role || 'student',
            phone: data.user.user_metadata?.phone || '',
            institution: data.user.user_metadata?.institution || '',
            academic_degree: data.user.user_metadata?.academic_degree || '',
            created_at: new Date().toISOString(),
          };

          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(activeUser));
          return { user: activeUser, error: null };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid login credentials.';
        return { user: null, error: message };
      }
    }

    // Local Storage Mode
    const profiles = getLocalProfiles();
    const userProfile = profiles[cleanEmail];

    if (!userProfile) {
      return { user: null, error: 'No account found with this email. Please create an account first.' };
    }

    if (userProfile.password && userProfile.password !== password) {
      return { user: null, error: 'Incorrect password. Please verify your credentials and try again.' };
    }

    // If role requested during login, allow updating role
    const activeUser: Profile = {
      id: userProfile.id,
      full_name: userProfile.full_name,
      email: userProfile.email,
      phone: userProfile.phone,
      role: selectedRole || userProfile.role,
      created_at: userProfile.created_at,
      institution: userProfile.institution,
      academic_degree: userProfile.academic_degree,
      profile_photo: userProfile.profile_photo,
    };

    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(activeUser));
    return { user: activeUser, error: null };
  },

  /**
   * Reset Password Request
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return { success: true, message: 'Password reset link sent to your email.' };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Password reset failed.';
        return { success: false, message };
      }
    }
    return { success: true, message: 'Password reset instructions sent to ' + cleanEmail };
  },

  /**
   * Update User Profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<{ user: Profile | null; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data));
          return { user: data as Profile, error: null };
        }
      } catch (err: unknown) {
        console.warn('Supabase update profile error, updating local:', err);
      }
    }

    // Local fallback
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      const current = JSON.parse(stored) as Profile;
      const updated = { ...current, ...updates };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));

      const profiles = getLocalProfiles();
      if (profiles[updated.email.toLowerCase()]) {
        profiles[updated.email.toLowerCase()] = { ...profiles[updated.email.toLowerCase()], ...updated };
        localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
      }

      return { user: updated, error: null };
    }

    return { user: null, error: 'User session not found.' };
  },

  /**
   * Update User Password in Supabase & Local Fallback Registry
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    let supabaseSuccess = false;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          console.error('Supabase update password error:', error.message);
          return { success: false, error: error.message };
        }
        supabaseSuccess = true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update password in Supabase';
        console.warn('Supabase password update error:', msg);
      }
    }

    // Always sync local storage user password as well
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      try {
        const current = JSON.parse(stored) as Profile;
        if (current?.email) {
          const profiles = getLocalProfiles();
          const emailKey = current.email.toLowerCase();
          if (profiles[emailKey]) {
            profiles[emailKey].password = newPassword;
            localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
          }
        }
      } catch (e) {
        console.warn('Local profile password update error:', e);
      }
    }

    return { success: true, error: null };
  },

  /**
   * Upload Profile Photo to Supabase Storage or Local Data URL
   */
  async uploadProfilePhoto(
    userId: string,
    file: File
  ): Promise<{ url: string | null; error: string | null }> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId || 'user'}_${Date.now()}.${fileExt}`;

    if (isSupabaseConfigured) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Supabase profile photo upload error:', uploadError);
        } else {
          const { data } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);

          if (data?.publicUrl) {
            return { url: data.publicUrl, error: null };
          }
        }
      } catch (err: unknown) {
        console.warn('Storage upload error:', err);
      }
    }

    // Fallback: convert file to Base64 Data URL so it works offline/locally
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
      return { url: dataUrl, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not process image file';
      return { url: null, error: message };
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Signout error:', err);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  },
};