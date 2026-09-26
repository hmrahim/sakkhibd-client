import React from 'react';
import { Shield, Scale } from 'lucide-react';

/**
 * Meaningful Anti-Corruption Theme Page Loader
 */
export default function PageLoader({ message = 'তথ্য যাচাই ও সিস্টেম লোড হচ্ছে...', theme = 'dark' }) {
  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-300 select-none ${
        isDark ? 'bg-[#040e09] text-white' : 'bg-[#061c12] text-white'
      }`}
    >
      {/* Background ambient glowing orbs */}
      <div className="absolute w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-[#F42A41]/10 blur-[110px] pointer-events-none" />

      {/* Main Container - Responsive & Fixed geometry without scale glitch */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-sm sm:max-w-md text-center">
        {/* Emblem - Fixed 110px on mobile, 120px on tablet/desktop */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6 sm:mb-8 flex items-center justify-center shrink-0">
          {/* Outer dashed spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/35 animate-[spin_8s_linear_infinite]" />
          
          {/* Reverse dual-color ring */}
          <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#F42A41] border-b-[#FFD700] animate-[spin_3.5s_linear_infinite_reverse]" />

          {/* Center Emblem badge */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#006A4E] to-[#10b981] flex items-center justify-center shadow-2xl shadow-emerald-950 ring-2 ring-emerald-400/40">
            <span className="font-black text-3xl sm:text-4xl text-[#FFD700] select-none font-sans drop-shadow-md">
              সা
            </span>
          </div>
        </div>

        {/* Brand Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold tracking-wider uppercase mb-3 shadow-md">
          <Shield size={14} className="text-emerald-400" />
          <span>সাক্ষীবিডি · SakkhiBD</span>
        </div>

        {/* Dynamic Loading Message */}
        <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-wide font-sans mb-3 sm:mb-4 px-2">
          {message}
        </h3>

        {/* Stable Progress Bar */}
        <div className="w-56 sm:w-72 h-2 bg-[#092115] rounded-full overflow-hidden border border-emerald-900/60 shadow-inner">
          <div className="h-full w-full bg-gradient-to-r from-[#006A4E] via-[#FFD700] to-[#F42A41] rounded-full animate-pulse" />
        </div>

        <span className="text-[11px] sm:text-xs text-zinc-400 mt-3 font-mono tracking-wider">
          সুরক্ষিত ও এনক্রিপ্টেড সংযোগ
        </span>
      </div>
    </div>
  );
}
