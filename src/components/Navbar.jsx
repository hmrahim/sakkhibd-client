import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useReports } from '../context/ReportContext';
import { Menu, X, PlusCircle, Download, Globe } from 'lucide-react';


const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { reports, setIsSubmitModalOpen, exportToCSV, lang, toggleLanguage, t } = useReports();

  const navLinks = [
    { name: t.navHome, path: '/' },
    { name: t.navBlogs, path: '/blogs' },
    { name: lang === 'bn' ? '📰 আর্টিকেল' : '📰 Articles', path: '/articles' },
    { name: t.navLedger, path: '/ledger' },
    { name: t.navAnalytics, path: '/analytics' },
    { name: t.navHierarchy, path: '/hierarchy' },
    { name: t.navAbout, path: '/about' },
  ];

  const tickerText = reports.slice(0, 10).map(b => 
    `🚨 ${b.district}: ${b.title} — [${lang === 'bn' ? 'দাবি' : 'Demand'}: ৳${b.amount.toLocaleString('en-US')}, ${b.outcome}]`
  ).join('          |          ');

  return (
    <header className="w-full max-w-full overflow-hidden">
      <div className="flag-stripe"></div>

      {/* ══════════════ DESKTOP HEADER (xl and up) ══════════════ */}
      <div className="hidden xl:block">
        {/* Top Bar with Language Toggle & CSV download */}
        <div className="bg-[#004d38] text-green-100 text-xs py-1.5 px-6 border-b border-green-800 flex justify-between items-center font-medium w-full">
          <div className="flex items-center gap-2 truncate pr-2 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FFD700] animate-pulse shrink-0"></span>
            <span className="truncate">{t.topBanner}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleLanguage}
              className="bg-white/15 hover:bg-white/25 text-[#FFD700] px-3 py-1 rounded-full text-xs font-bold border border-white/25 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0"
              title="ভাষা পরিবর্তন / Switch Language"
            >
              <Globe size={12} />
              <span>{t.toggleLanguage}</span>
            </button>

            <button
              onClick={exportToCSV}
              className="flex bg-[#006A4E] hover:bg-emerald-700 text-white px-2.5 py-1 rounded-full text-xs border border-green-600 items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <Download size={12} /> {t.csvDownload}
            </button>
          </div>
        </div>

        {/* Breaking News Ticker */}
        <div className="bg-[#F42A41] text-white text-sm py-1.5 overflow-hidden shadow-sm w-full">
          <div className="ticker-wrap w-full">
            <span className="ticker-text font-medium px-4">
              {tickerText || (lang === 'bn' ? 'লোড হচ্ছে সর্বশেষ দুর্নীতির রিপোর্ট...' : 'Loading latest corruption reports...')}
            </span>
          </div>
        </div>

        {/* Navbar Main */}
        <nav className="bg-[#006A4E] shadow-lg sticky top-0 z-50 w-full">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full">
            <div className="flex items-center justify-between h-16 w-full">
              <Link to="/" className="flex items-center gap-2 cursor-pointer no-underline shrink-0 mr-4">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-[#FFD700] text-emerald-950 font-black text-base flex items-center justify-center shadow-md">
                  সা
                </span>
                <span className="text-white font-black text-xl tracking-tight whitespace-nowrap hover:text-[#FFD700] transition-colors">
                  {lang === 'bn' ? 'সাক্ষীবিডি' : 'SakkhiBD'}
                </span>
              </Link>

              <div className="flex items-center gap-4 text-sm shrink-0">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-green-100 font-medium whitespace-nowrap no-underline hover:text-[#FFD700] transition-colors py-1 ${
                        isActive ? 'text-[#FFD700] font-bold border-b-2 border-[#FFD700]' : ''
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="bg-[#F42A41] hover:bg-[#c0172c] text-white px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap shrink-0 hover:shadow-lg transform hover:scale-[1.02]"
                >
                  <PlusCircle size={15} className="shrink-0" />
                  <span>{t.reportBribeBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* ══════════════ MOBILE APP-STYLE HEADER (below xl) ══════════════ */}
      <div className="xl:hidden sticky top-0 z-50 shadow-md">
        <div className="bg-[#006A4E] pt-safe">
          <div className="flex items-center justify-between px-3.5 h-14">
            <Link to="/" className="flex items-center gap-2 cursor-pointer no-underline shrink-0 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-[#FFD700] text-emerald-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
                সা
              </span>
              <span className="text-white font-black text-base tracking-tight whitespace-nowrap truncate">
                {lang === 'bn' ? 'সাক্ষীবিডি' : 'SakkhiBD'}
              </span>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={toggleLanguage}
                className="w-9 h-9 rounded-full bg-white/15 active:bg-white/25 text-[#FFD700] flex items-center justify-center cursor-pointer transition-colors"
                title="ভাষা পরিবর্তন / Switch Language"
              >
                <Globe size={15} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 rounded-full bg-white/15 active:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>

        {/* Compact breaking-news ticker */}
        <div className="bg-[#F42A41] text-white text-[11px] py-1 overflow-hidden w-full">
          <div className="ticker-wrap w-full">
            <span className="ticker-text font-medium px-4">
              {tickerText || (lang === 'bn' ? 'লোড হচ্ছে সর্বশেষ দুর্নীতির রিপোর্ট...' : 'Loading latest corruption reports...')}
            </span>
          </div>
        </div>

        {/* Optional full link list + CSV, tucked away behind the hamburger */}
        {mobileMenuOpen && (
          <div className="bg-[#004d38] border-t border-green-700 px-4 py-3 space-y-1 animate-fade-in shadow-2xl w-full">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-3 rounded-xl font-medium no-underline text-sm transition-colors ${
                    isActive
                      ? 'bg-[#006A4E] text-[#FFD700] font-bold'
                      : 'text-green-100 hover:bg-[#006A4E]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <button
              onClick={() => { exportToCSV(); setMobileMenuOpen(false); }}
              className="w-full mt-1 flex items-center gap-2 bg-[#006A4E] hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
            >
              <Download size={14} /> {t.csvDownload}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
