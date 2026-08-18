import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { GraduationCap, Lock, Mail, User, Phone, School, BookOpen, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [academicDegree, setAcademicDegree] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await register(
      fullName,
      email,
      password,
      role,
      phone,
      institution,
      academicDegree
    );

    setIsLoading(false);

    if (res.success) {
      if (role === 'student') navigate('/dashboard');
      else if (role === 'freelancer') navigate('/freelancer');
      else navigate('/admin');
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl">
          <div className="text-center mb-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-xs text-slate-500">
              Connect with specialized assistants to elevate your academic work.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Registering As:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    role === 'student'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    role === 'freelancer'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Freelancer
                </button>
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

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter Email
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

            {/* Grid 2 Column: Phone & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 000-0000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">University / Institute</label>
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
            </div>

            {/* Academic Degree / Program */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Degree / Program
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={academicDegree}
                  onChange={(e) => setAcademicDegree(e.target.value)}
                  placeholder="B.S Computer Science"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
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
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};