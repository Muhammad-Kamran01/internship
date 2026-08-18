import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is Student Assistant and how does it differ from Fiverr or Upwork?',
      a: 'Student Assistant is an Academic Project Management System powered by specialized internal AI Agents. Rather than browsing external freelance profiles, tasks are automatically routed to purpose-built agents (e.g. Programming Agent, Documentation Agent) with real-time status tracking.',
    },
    {
      q: 'How does Supabase handle data storage and security?',
      a: 'All student accounts, project details, and file attachments are stored in Supabase with Row Level Security (RLS) enabled. Only authorized users can access their submitted projects.',
    },
    {
      q: 'What file formats can I attach to my project submission?',
      a: 'You can upload PDF, Word (DOC, DOCX), PowerPoint (PPT, PPTX), Excel (XLS, XLSX), ZIP, RAR, TXT, and Images (PNG, JPG) up to 20MB per file.',
    },
    {
      q: 'How does the AI Agent Pre-Assessment Engine work?',
      a: 'Before or upon submitting a project, our pre-analysis engine inspects your prompt and attached files to estimate turnaround time, project complexity, and recommended budget.',
    },
    {
      q: 'Are the generated materials plagiarism-free?',
      a: 'Yes. All deliverables undergo automated originality verification to ensure compliance with academic standards.',
    },
  ];

  return (
    <section id="faq" className="py-16 bg-slate-50/80 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider">
            FAQs
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm">
            Everything you need to know about Student Assistant and our specialized teams.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};