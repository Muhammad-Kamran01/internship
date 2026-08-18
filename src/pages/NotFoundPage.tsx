import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { GraduationCap, ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
          <GraduationCap className="w-9 h-9" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          The requested page or academic project resource does not exist or has been moved.
        </p>

        <div className="pt-2">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-full text-xs font-bold justify-center"
          >
            Return to Student Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
