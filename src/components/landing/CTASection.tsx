import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10K+', label: 'Projects Completed' },
    { value: '5K+', label: 'Happy Students' },
    { value: '50+', label: 'AI Agents' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white p-8 sm:p-12 lg:p-14 shadow-xl">
        {/* Decorative background graphics */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-4 bottom-0 w-80 h-full opacity-20 pointer-events-none hidden sm:block">
          <div className="absolute right-0 bottom-0 w-24 h-64 bg-white rounded-full transform rotate-45" />
          <div className="absolute right-24 bottom-12 w-16 h-48 bg-white rounded-full transform rotate-45" />
          <div className="absolute right-48 bottom-24 w-12 h-32 bg-white rounded-full transform rotate-45" />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          {/* Header & Subtext - Centered Layout */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight lg:whitespace-nowrap">
              Ready to Accelerate Your Academic Projects?
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto font-normal">
              Submit your requirements today and let our specialized AI Agents handle your documentation, code, thesis reviews, and presentation slide decks.
            </p>

            {/* Centered Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/projects/new')}
                className="bg-white text-blue-700 hover:bg-slate-100 border-none font-bold shadow-lg"
              >
                Submit Project Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 font-semibold shadow-md"
              >
                Create Free Account
              </Button>
            </div>

          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/15">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`relative space-y-1 text-center md:text-left ${
                  index !== 0 ? 'md:border-l md:border-white/20 md:pl-6' : ''
                }`}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-blue-100/90 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};