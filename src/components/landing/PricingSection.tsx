// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '../common/Button';
// import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

// export const PricingSection: React.FC = () => {
//   const navigate = useNavigate();

//   const plans = [
//     {
//       name: 'Single Task Submission',
//       price: 'Pay-Per-Task',
//       subtitle: 'Ideal for individual assignments, SRS docs, or single code tasks.',
//       popular: false,
//       features: [
//         'Instant AI Pre-Assessment',
//         'Specialized Agent Assignment',
//         'Turnitin-Compatible Plagiarism Audit',
//         'Up to 20MB File Attachments',
//         'Direct Comments with Agent',
//         'Downloadable Deliverables (Zip/Docx)',
//       ],
//       ctaText: 'Submit Task Now',
//       variant: 'outline' as const,
//     },
//     {
//       name: 'Semester Pro Pass',
//       price: '$29',
//       period: '/ month',
//       subtitle: 'Best value for students managing FYPs, courseworks & term papers.',
//       popular: true,
//       features: [
//         'Everything in Single Task',
//         'Priority Agent Turnaround Queue',
//         'Unlimited AI Pre-Assessments',
//         'Free Code & SRS Revision Requests',
//         'Premium Slide Deck Generation',
//         '24/7 Express Support',
//       ],
//       ctaText: 'Get Semester Pass',
//       variant: 'primary' as const,
//     },
//     {
//       name: 'FYP & Research Package',
//       price: '$89',
//       period: '/ project',
//       subtitle: 'Complete end-to-end support for Final Year Projects & Master Thesis.',
//       popular: false,
//       features: [
//         'Full System Architecture & SRS',
//         'Complete Source Code Repository',
//         'Database Schema & ER Diagrams',
//         'IEEE / APA Paper & Defense Slides',
//         'Plagiarism & Originality Guarantee Report',
//         'Dedicated Agent & Supervisor Oversight',
//       ],
//       ctaText: 'Start FYP Project',
//       variant: 'outline' as const,
//     },
//   ];

//   return (
//     <section id="pricing" className="py-16 bg-white border-t border-slate-200/80">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
//           <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
//             <Sparkles className="w-3.5 h-3.5" /> Transparent Pricing
//           </span>
//           <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
//             Simple & Accessible Academic Plans
//           </h2>
//           <p className="text-slate-600 text-sm sm:text-base">
//             Choose a pay-per-task model or subscribe for semester-long academic agent support.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
//           {plans.map((plan, idx) => (
//             <div
//               key={idx}
//               className={`rounded-3xl border p-8 flex flex-col justify-between relative transition-all duration-200 ${
//                 plan.popular
//                   ? 'border-blue-600 bg-slate-900 text-white shadow-xl shadow-blue-500/10 ring-2 ring-blue-600'
//                   : 'border-slate-200 bg-white text-slate-900 hover:shadow-lg'
//               }`}
//             >
//               {plan.popular && (
//                 <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
//                   Most Popular
//                 </div>
//               )}

//               <div>
//                 <h3 className={`text-lg font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
//                   {plan.name}
//                 </h3>
//                 <p className={`text-xs mb-6 ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>
//                   {plan.subtitle}
//                 </p>

//                 <div className="flex items-baseline gap-1 mb-6">
//                   <span className={`text-4xl font-black tracking-tight ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
//                     {plan.price}
//                   </span>
//                   {plan.period && (
//                     <span className={`text-xs font-semibold ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
//                       {plan.period}
//                     </span>
//                   )}
//                 </div>

//                 <div className="space-y-3 mb-8">
//                   <p className={`text-xs font-bold uppercase tracking-wider ${plan.popular ? 'text-blue-400' : 'text-slate-700'}`}>
//                     Included Features:
//                   </p>
//                   <ul className="space-y-2.5 text-xs">
//                     {plan.features.map((feature, fIdx) => (
//                       <li key={fIdx} className="flex items-start gap-2.5">
//                         <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-blue-400' : 'text-blue-600'}`} />
//                         <span className={plan.popular ? 'text-slate-200' : 'text-slate-600'}>
//                           {feature}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>

//               <Button
//                 variant={plan.variant}
//                 size="lg"
//                 className={`w-full justify-center font-bold text-xs ${
//                   plan.popular
//                     ? 'bg-blue-600 hover:bg-blue-500 text-white border-none shadow-md shadow-blue-500/30'
//                     : ''
//                 }`}
//                 onClick={() => navigate('/projects/new')}
//                 icon={<ArrowRight className="w-4 h-4" />}
//               >
//                 {plan.ctaText}
//               </Button>
//             </div>
//           ))}
//         </div>

//         <div className="mt-12 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-900">
//           <div className="flex items-center gap-3">
//             <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
//             <div>
//               <p className="font-bold">100% Originality & Confidentiality Guaranteed</p>
//               <p className="text-blue-700">All submissions are processed under strict privacy protocols and originality checks.</p>
//             </div>
//           </div>
//           <Button variant="outline" size="sm" onClick={() => navigate('/register')} className="shrink-0 bg-white">
//             Create Free Account
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// };
