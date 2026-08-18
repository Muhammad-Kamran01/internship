import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ success?: boolean; text?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await forgotPassword(email);
    setIsLoading(false);
    setResponseMsg({ success: res.success, text: res.message });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl">
          <div className="text-center mb-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Forgot Password</h2>
            <p className="text-xs text-slate-500">
              Enter your email address to receive password reset instructions.
            </p>
          </div>

          {responseMsg.text && (
            <div
              className={`p-3.5 mb-4 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                responseMsg.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {responseMsg.success && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              <span>{responseMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Account Email Address
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-sm font-bold justify-center"
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
