import React from 'react';
import { UploadCloud, Cpu, UserCheck, Clock, ShieldCheck, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {

    const steps = [
    {
      step: '01',
      title: 'Submit Academic Task',
      description: 'Fill in your project title, prompt, deadline, category, and attach reference files (PDF, Word, Code, ZIP).',
      icon: <UploadCloud className="w-6 h-6 text-blue-600" />,
    },
    {
      step: '02',
      title: 'Analysis & Planning',
      description: 'Our system runs automated requirement analysis to estimate turnaround time, complexity, and optimal workflow.',
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
    },
    {
      step: '03',
      title: 'Task Assign',
      description: 'Your project is routed to the specialized AI Agent (e.g. Programming Agent or SRS Documentation Agent).',
      icon: <UserCheck className="w-6 h-6 text-indigo-600" />,
    },
    {
      step: '04',
      title: 'Real-Time Progress',
      description: 'Track progress bars live on your dashboard and exchange comments or supplemental files with your agent.',
      icon: <Clock className="w-6 h-6 text-amber-600" />,
    },
    {
      step: '05',
      title: 'Quality & Plagiarism Audit',
      description: 'All generated code, documents, and slides undergo rigorous accuracy and plagiarism verification.',
      icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
    },
    {
      step: '06',
      title: 'Download Deliverables',
      description: 'Access final clean deliverables, code repositories, and slide decks directly from your secure student panel.',
      icon: <Download className="w-6 h-6 text-emerald-600" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Simple Workflow
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Student Assistant Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Streamline your academic workflow from initial submission to final delivery. Effortless academic project management from start to finish.
          </p>
        </div>

        {/* Horizontal Process Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex flex-col items-center text-center p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow duration-200"
            >
              {/* Number Badge */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                {item.step}
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
        <br></br>

        {/* Detailed Process Steps */}
        <p className="mt-4 text-1xl sm:text-2xl text-slate-900 tracking-tight text-center mb-8">
            Detailed Steps of the Student Assistant Workflow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 relative hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white shadow-2xs border border-slate-200/60">
                  {item.icon}
                </div>
                <span className="text-2xl font-black text-slate-300">{item.step}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};