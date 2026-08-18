import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { GraduationCap, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await login(email, password, role);
    setIsLoading(false);

    if (res.success) {
      if (role === 'student') navigate('/dashboard');
      else if (role === 'freelancer') navigate('/freelancer');
      else navigate('/admin');
    } else {
      setErrorMsg(res.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl">
          <div className="text-center mb-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500">
              Sign in to manage your academic tasks and assistants.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Radio Pills */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                
              </label>
              <div className="">
                {/* <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    role === 'student'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Student
                </button> */}
                {/* <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    role === 'freelancer'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Freelancer
                </button> */}
                {/* <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    role === 'admin'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button> */}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-sm font-bold justify-center mt-2 shadow-md"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};