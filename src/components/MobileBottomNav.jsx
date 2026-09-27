import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Newspaper,
  ScrollText,
  Megaphone,
  Grid3x3,
  BarChart3,
  Landmark,
  Info,
  Globe,
  Download,
  LayoutDashboard,
  LogIn,
  X,
} from 'lucide-react';

const LABELS = {
  home: { bn: 'হোম', en: 'Home' },
  blogs: { bn: 'অভিযোগ', en: 'Feed' },
  ledger: { bn: 'লেজার', en: 'Ledger' },
  articles: { bn: 'আর্টিকেল', en: 'Articles' },
  more: { bn: 'আরও', en: 'More' },
  report: { bn: 'রিপোর্ট', en: 'Report' },
  analytics: { bn: 'চার্ট বিশ্লেষণ', en: 'Analytics' },
  hierarchy: { bn: 'বিভাগীয় ড্রিল-ডাউন', en: 'Regional Breakdown' },
  about: { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
  language: { bn: 'ভাষা পরিবর্তন করুন', en: 'Switch Language' },
  csv: { bn: 'CSV ডেটা ডাউনলোড', en: 'Download CSV Data' },
  dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  login: { bn: 'লগ ইন করুন', en: 'Login' },
  menuTitle: { bn: 'আরও অপশন', en: 'More Options' },
};

const TabLink = ({ to, isActive, Icon, label }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer no-underline select-none"
  >
    <span
      className={`flex items-center justify-center w-11 h-8 rounded-full transition-all duration-200 ${
        isActive ? 'bg-[#e8f5f0] text-[#006A4E] scale-105' : 'text-gray-400'
      }`}
    >
      <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
    </span>
    <span className={`text-[10px] leading-none ${isActive ? 'text-[#006A4E] font-bold' : 'text-gray-400 font-medium'}`}>
      {label}
    </span>
  </Link>
);

const SheetLink = ({ onClick, Icon, label, accent }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-[#e8f5f0] active:scale-[0.98] transition-all cursor-pointer text-left"
  >
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent || 'bg-white text-[#006A4E]'} shadow-xs`}>
      <Icon size={17} />
    </span>
    <span className="font-bold text-sm text-gray-800">{label}</span>
  </button>
);

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsSubmitModalOpen, exportToCSV, toggleLanguage, lang } = useReports();
  const { currentUser } = useAuth() || {};
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const goTo = (path) => {
    setSheetOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Slide-up "More" sheet */}
      {sheetOpen && (
        <div className="xl:hidden fixed inset-0 z-[70]" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-safe animate-slide-up shadow-2xl max-h-[75vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3">
              <span className="w-10 h-1.5 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <h3 className="font-extrabold text-[#004d38] text-base">{LABELS.menuTitle[lang]}</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-4 pb-4 grid grid-cols-1 gap-2">
              <SheetLink onClick={() => goTo('/articles')} Icon={Newspaper} label={LABELS.articles[lang]} accent="bg-[#e8f5f0] text-[#006A4E]" />
              <SheetLink onClick={() => goTo('/analytics')} Icon={BarChart3} label={LABELS.analytics[lang]} accent="bg-[#e8f5f0] text-[#006A4E]" />
              <SheetLink onClick={() => goTo('/hierarchy')} Icon={Landmark} label={LABELS.hierarchy[lang]} accent="bg-[#e8f5f0] text-[#006A4E]" />
              <SheetLink onClick={() => goTo('/about')} Icon={Info} label={LABELS.about[lang]} accent="bg-[#e8f5f0] text-[#006A4E]" />
            </div>

            <div className="h-px bg-gray-100 mx-4" />

            <div className="px-4 py-4 grid grid-cols-1 gap-2">
              <SheetLink
                onClick={() => { toggleLanguage(); setSheetOpen(false); }}
                Icon={Globe}
                label={LABELS.language[lang]}
                accent="bg-amber-50 text-amber-600"
              />
              <SheetLink
                onClick={() => { exportToCSV(); setSheetOpen(false); }}
                Icon={Download}
                label={LABELS.csv[lang]}
                accent="bg-blue-50 text-blue-600"
              />
              <SheetLink
                onClick={() => goTo(currentUser ? '/dashboard' : '/login')}
                Icon={currentUser ? LayoutDashboard : LogIn}
                label={currentUser ? LABELS.dashboard[lang] : LABELS.login[lang]}
                accent="bg-emerald-50 text-emerald-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 mobile-bottom-nav pb-safe">
        <div className="relative flex items-stretch h-16 max-w-lg mx-auto px-1">
          <TabLink to="/" isActive={isActive('/')} Icon={Home} label={LABELS.home[lang]} />
          <TabLink to="/blogs" isActive={isActive('/blogs')} Icon={Newspaper} label={LABELS.blogs[lang]} />

          {/* Center floating report button */}
          <div className="flex flex-col items-center justify-end flex-1 relative">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="absolute -top-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#F42A41] to-[#c0172c] text-white flex items-center justify-center fab-glow cursor-pointer active:scale-95 transition-transform"
              aria-label={LABELS.report[lang]}
            >
              <Megaphone size={24} />
            </button>
            <span className="text-[10px] font-bold text-[#c0172c] mb-1.5">{LABELS.report[lang]}</span>
          </div>

          <TabLink to="/ledger" isActive={isActive('/ledger')} Icon={ScrollText} label={LABELS.ledger[lang]} />

          <button
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer select-none"
          >
            <span className="flex items-center justify-center w-11 h-8 rounded-full text-gray-400">
              <Grid3x3 size={20} />
            </span>
            <span className="text-[10px] leading-none text-gray-400 font-medium">{LABELS.more[lang]}</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
