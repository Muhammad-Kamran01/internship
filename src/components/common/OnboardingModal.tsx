import React, { useState, useEffect } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'student' | 'freelancer';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, role }) => {
  const [imageError, setImageError] = useState<boolean>(false);

  // Determine image path based on role
  const isStudent = role === 'student';
  const isFreelancer = role === 'freelancer';
  const baseUrl = import.meta.env.BASE_URL || '/';
  const assetFileName = isStudent ? 'welcome-student.png' : isFreelancer ? 'welcome-assistant.png' : 'welcome-assistant.png';
  const customImagePath = `${baseUrl}${assetFileName}`;

  useEffect(() => {
    setImageError(false);
  }, [role, isOpen]);

  if (!isOpen) return null;

  return (
    /* Dimmed backdrop overlay - clicking outside closes the popup */
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container wraps ONLY the image asset */}
      <div 
        className="relative max-w-4xl w-auto max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!imageError ? (
          <div className="relative inline-block">
            {/* DISPLAY UPLOADED IMAGE DEPENDING ON ROLE */}
            <img
              src={customImagePath}
              alt={isStudent ? 'Welcome Student' : 'Welcome Assistant'}
              className="max-h-[88vh] w-auto h-auto block object-contain select-none drop-shadow-2xl"
              onError={() => setImageError(true)}
            />

            {/* Invisible hotspot over top-right close icon in your image */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-10 h-10 rounded-full opacity-0 hover:bg-black/10 cursor-pointer"
              aria-label="Close"
            />

            {/* Invisible hotspot over "Let's Get Started" button in your image */}
            <button
              onClick={onClose}
              className="absolute bottom-4 right-4 w-40 h-12 rounded-xl opacity-0 hover:bg-black/10 cursor-pointer"
              aria-label="Get Started"
            />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl text-center space-y-3 shadow-xl">
            <p className="text-xs text-slate-500">
              Image not found at <code className="text-blue-600 font-semibold">public{customImagePath}</code>
            </p>
            <p className="text-[11px] text-slate-400">
              Ensure your file is named <code className="text-slate-600">welcome-student.png</code> or <code className="text-slate-600">welcome-assistant.png</code> in the <code className="text-slate-600">/public</code> folder.
            </p>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};