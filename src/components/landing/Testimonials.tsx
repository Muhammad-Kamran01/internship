import React from 'react';
import { Star, GraduationCap, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Sarah Jenkins',
      degree: 'B.S. Software Engineering',
      university: 'University of Washington',
      rating: 5,
      comment:
        'The SRS Documentation Agent generated a spotless IEEE standard document for my Final Year Project. Saved me over 40 hours of formatting diagrams!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    },
    {
      name: 'Alex Rivera',
      degree: 'M.S. Computer Science',
      university: 'Georgia Tech',
      rating: 5,
      comment:
        'The Programming Agent helped debug my Node.js microservices architecture. Clean code, well commented, and delivered 2 days ahead of deadline.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    },
    {
      name: 'Priya Sharma',
      degree: 'Data Science Undergraduate',
      university: 'UC Berkeley',
      rating: 5,
      comment:
        'Literature Review agent summarized 20 peer-reviewed papers with perfect APA citations. Highly recommend Student Assistant!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Student Feedback
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Students Worldwide
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            See how Student Assistant empowers students across top universities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, index) => (
            <div
              key={index}
              className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 relative flex flex-col justify-between"
            >
              <Quote className="w-8 h-8 text-blue-200 absolute top-4 right-4 pointer-events-none" />
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-6 italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                  <p className="text-[10px] text-blue-600 font-semibold">{rev.degree}</p>
                  <p className="text-[10px] text-slate-400">{rev.university}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};