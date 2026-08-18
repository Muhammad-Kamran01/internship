import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Bot, GraduationCap, CheckCircle2 } from 'lucide-react';
import HeroImage from '../images/hero-image.png';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
      <section id="hero" className="relative overflow-hidden bg-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 -z-10 w-80 h-80 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none"></div>
  
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
  
              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Your Academic Success <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Powered by Student Assistant
                </span>
              </h1>
  
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Submit your FYP, Programming Projects, SRS Documentation, Thesis or Coursework. Our specialized team analyze, code, draft, and deliver high-quality academic deliverables with real-time status tracking.
              </p>
  
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/projects/new')}
                  className="shadow-lg shadow-blue-500/25"
                >
                  Submit Academic Task
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('ai-agents');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Our Specialized Assistants
                </Button>
              </div>
  
              {/* Value Props */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Plagiarism Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Strict Confidentiality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Instant Pre-Analysis</span>
                </div>
              </div>
            </div>
  
            {/* Right Visual Card Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glassmorphism Outer Box */}
                <div className="lg:col-span-5 flex items-center justify-center">
                  <img
                  src={HeroImage}
                  alt="Student Assistant Hero"
                  className="w-full max-w-xl rounded-3xl object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
};