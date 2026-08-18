import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Sparkles, Facebook, Instagram, Linkedin, Twitter, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Student Assistant</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Academic Assistant is a Marketplace & Project Management System. Connecting the students with the specialized agents and academic advisors.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-500 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-sky-500 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Academic Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Academic Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/projects/new" className="hover:text-white transition-colors">Final Year Project (FYP)</Link></li>
              <li><Link to="/projects/new" className="hover:text-white transition-colors">Short & Course Projects</Link></li>
              <li><Link to="/projects/new" className="hover:text-white transition-colors">Documentation & Thesis Writing</Link></li>
              <li><Link to="/projects/new" className="hover:text-white transition-colors">Assignments Writing & Plagiarism Removing</Link></li>
              <li><Link to="/projects/new" className="hover:text-white transition-colors">Presentations & Slides Designing (PPT)</Link></li>
            </ul>
          </div>

          {/* AI Agents */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Specialized AI Agents</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Documentation Agent</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Programming Agent</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Presentation Agent</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Research Agent</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Academic Advisors</span>
              </li>
            </ul>
          </div>

          {/* Legal & Guarantee */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Academic Integrity</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Student Assistant operates with strict plagiarism audits and ethical guidelines. All generated materials serve as structured study & models. Your privacy and academic trust remain our highest priority.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Confidential & Ethical Work</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Student Assistant. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};