import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(
    location.pathname
  );

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              Student Assistant
            </span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
              AI Academic Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-6">
            <a href="#hero" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#ai-agents" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Assistants
            </a>
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Services
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              FAQs
            </a>
          </nav>
        )}

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (user.role === 'student') navigate('/dashboard');
                  else if (user.role === 'freelancer') navigate('/freelancer');
                  else navigate('/admin');
                }}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-xs text-slate-500 hover:text-rose-600"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-slide-down">
          {!isAuthPage && (
            <div className="flex flex-col space-y-2 pt-2 border-b border-slate-100 pb-3">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 py-1"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 py-1"
              >
                How It Works
              </a>
              <a
                href="#ai-agents"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 py-1"
              >
                Agents
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 py-1"
              >
                Services
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 py-1"
              >
                Pricing
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 py-1"
              >
                About
              </a>
            </div>
          )}

          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <Button
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (user.role === 'student') navigate('/dashboard');
                  else if (user.role === 'freelancer') navigate('/freelancer');
                  else navigate('/admin');
                }}
              >
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};