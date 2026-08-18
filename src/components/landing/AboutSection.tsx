import React from 'react';
import { GraduationCap, ShieldCheck, Users, Cpu, Award, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-slate-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> About Student Assistant
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Empowering Students with Dedicated AI Academic Intelligence
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-5">

            <p className="text-base text-slate-900 leading-relaxed text-justify">
              Student Assistant was created to revolutionize how university students, researchers, and scholars tackle complex academic assignments, FYP projects, Software Requirement Specifications (SRS), programming tasks, and defense presentations.
            </p>

            <p className="text-base text-slate-900 leading-relaxed text-justify">
              Our platform bridges cutting-edge AI Agent automation with strict academic standards, ensuring every deliverable is plagiarism-free, properly cited, systematically structured, and delivered on time.
            </p>

            <div className=" mt-6 grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-1">
                  <GraduationCap className="w-5 h-5" /> 80+ Assistants
                </div>
                <p className="text-xs text-slate-500">Domain-specialized assistants for coding, SRS, thesis & slides.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-1">
                  <ShieldCheck className="w-5 h-5" /> 100% Plagiarism Free
                </div>
                <p className="text-xs text-slate-500">Automated originality audit and Turnitin-compatible checks.</p>
              </div>
            </div>
          </div>

          {/* Right Column / Key Highlights */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Our Core Academic Commitments
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Academic Integrity First</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                      All generated code, documents, and slides adhere strictly to IEEE, APA, and MLA academic formatting standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Multi-Role Ecosystem</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                      Seamless collaboration between Students, Internal AI Agents, and Platform Administrators for smooth execution.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Enterprise Data Privacy</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                      Your university credentials, project attachments, and personal information are protected by encrypted storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};