import React from 'react';
import { useReports } from '../context/ReportContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = () => {
  const { showToast, toastMessage, toastType = 'success', closeToast, lang } = useReports();

  if (!showToast) return null;

  const config = {
    success: {
      bg: 'bg-gradient-to-r from-[#00543e] to-[#006A4E]',
      border: 'border-emerald-500/40',
      icon: <CheckCircle2 size={24} className="text-[#FFD700] shrink-0 animate-bounce-short" />,
      tag: lang === 'bn' ? 'সফল হয়েছে' : 'Success',
      sub: lang === 'bn' ? 'ধন্যবাদ আপনার সাহসী পদক্ষেপের জন্য।' : 'Thank you for your courage & civic duty.',
      badgeBg: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30'
    },
    error: {
      bg: 'bg-gradient-to-r from-[#7f1d1d] to-[#991b1b]',
      border: 'border-red-500/40',
      icon: <AlertCircle size={24} className="text-red-200 shrink-0" />,
      tag: lang === 'bn' ? 'ব্যর্থ হয়েছে' : 'Failed',
      sub: lang === 'bn' ? 'দয়া করে পুনরায় চেষ্টা করুন।' : 'Please check details and try again.',
      badgeBg: 'bg-red-400/20 text-red-200 border-red-400/30'
    },
    warning: {
      bg: 'bg-gradient-to-r from-[#78350f] to-[#92400e]',
      border: 'border-amber-500/40',
      icon: <AlertTriangle size={24} className="text-amber-300 shrink-0" />,
      tag: lang === 'bn' ? 'সতর্কতা' : 'Warning',
      sub: lang === 'bn' ? 'প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please check required fields.',
      badgeBg: 'bg-amber-400/20 text-amber-200 border-amber-400/30'
    },
    info: {
      bg: 'bg-gradient-to-r from-[#1e3a8a] to-[#1e40af]',
      border: 'border-blue-500/40',
      icon: <Info size={24} className="text-blue-300 shrink-0" />,
      tag: lang === 'bn' ? 'তথ্য' : 'Info',
      sub: '',
      badgeBg: 'bg-blue-400/20 text-blue-200 border-blue-400/30'
    }
  };

  const current = config[toastType] || config.success;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] animate-slide-up max-w-sm sm:max-w-md w-full px-3 sm:px-0">
      <div className={`${current.bg} ${current.border} text-white px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3.5 border backdrop-blur-md relative overflow-hidden`}>
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        {current.icon}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${current.badgeBg}`}>
              {current.tag}
            </span>
          </div>
          <div className="font-bold text-sm text-white/95 leading-snug break-words">
            {toastMessage}
          </div>
          {current.sub && (
            <div className="text-white/70 text-xs font-normal mt-0.5">
              {current.sub}
            </div>
          )}
        </div>

        {closeToast && (
          <button
            onClick={closeToast}
            className="absolute top-3.5 right-3 text-white/60 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/10"
            aria-label="Close alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
