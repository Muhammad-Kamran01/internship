import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { authService } from '../services/supabase/authService';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (
    fullName: string,
    email: string,
    password: string,
    role?: UserRole,
    phone?: string,
    institution?: string,
    academicDegree?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  switchDemoRole: (role: UserRole) => void;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { user: current } = await authService.getCurrentSession();
        if (mounted) {
          setUser(current);
        }
      } catch (err) {
        console.warn('Error loading initial auth session:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadUser();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile && mounted) {
              setUser(profile as Profile);
              localStorage.setItem('student_assistant_user_session', JSON.stringify(profile));
              return;
            }
          } catch (e) {
            console.warn('Error fetching Supabase profile in auth listener:', e);
          }

          if (mounted) {
            const fallbackProfile: Profile = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as UserRole) || 'student',
              phone: session.user.user_metadata?.phone || '',
              institution: session.user.user_metadata?.institution || '',
              academic_degree: session.user.user_metadata?.academic_degree || '',
              created_at: session.user.created_at,
            };
            setUser(fallbackProfile);
            localStorage.setItem('student_assistant_user_session', JSON.stringify(fallbackProfile));
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            localStorage.removeItem('student_assistant_user_session');
          }
        }
      });

      return () => {
        mounted = false;
        authListener?.subscription?.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    setLoading(true);
    const { user: loggedIn, error } = await authService.login(email, password, role);
    setLoading(false);
    if (loggedIn && !error) {
      setUser(loggedIn);
      return { success: true };
    }
    return { success: false, error: error || 'Authentication failed.' };
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: UserRole = 'student',
    phone?: string,
    institution?: string,
    academicDegree?: string
  ) => {
    setLoading(true);
    const { user: registered, error } = await authService.register(
      fullName,
      email,
      password,
      role,
      phone,
      institution,
      academicDegree
    );
    setLoading(false);
    if (registered && !error) {
      setUser(registered);
      return { success: true };
    }
    return { success: false, error: error || 'Registration failed.' };
  };

  const logout = async () => {
    setLoading(true);
    await authService.logout();
    setUser(null);
    setLoading(false);
  };

  const forgotPassword = async (email: string) => {
    return await authService.forgotPassword(email);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { success: false, error: 'No active session' };
    const { user: updated, error } = await authService.updateProfile(user.id, updates);
    if (updated && !error) {
      setUser(updated);
      return { success: true };
    }
    return { success: false, error: error || 'Profile update failed.' };
  };

  const switchDemoRole = (role: UserRole) => {
    if (!user) {
      const demoUser: Profile = {
        id: 'usr-demo-' + role,
        full_name: role === 'admin' ? 'Platform Administrator' : role === 'freelancer' ? 'Senior Academic Assistant' : 'Computer Science Student',
        email: role === 'admin' ? 'admin@studentassistant.com' : role === 'freelancer' ? 'assistant@studentassistant.com' : 'student@studentassistant.com',
        role: role,
        created_at: new Date().toISOString(),
        institution: 'National University of Sciences & Technology',
        academic_degree: 'BS Computer Science',
      };
      setUser(demoUser);
      localStorage.setItem('student_assistant_user_session', JSON.stringify(demoUser));
      return;
    }
    const updatedUser: Profile = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem('student_assistant_user_session', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        forgotPassword,
        updateProfile,
        switchDemoRole,
        isSupabaseActive: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};