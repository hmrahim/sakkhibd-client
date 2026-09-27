import React from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportContext';
import { Download, PhoneCall, ExternalLink, Globe } from 'lucide-react';

const Footer = () => {
  const { exportToCSV, t, toggleLanguage, lang } = useReports();

  return (
    <footer className="relative text-white py-12 px-4 mt-20 overflow-hidden" style={{background: 'linear-gradient(180deg, #002d1f 0%, #004d35 40%, #006A4E 70%, #003d2a 100%)'}}>
      {/* Top border stripe: BD flag colors */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{background: 'linear-gradient(90deg, #006A4E 0%, #F42A41 40%, #006A4E 60%, #FFD700 80%, #006A4E 100%)'}} />

      {/* Ambient glow blobs – like hero section */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full opacity-20" style={{background: 'radial-gradient(circle, #006A4E 0%, transparent 70%)', filter: 'blur(60px)'}} />
        <div className="absolute top-0 right-1/4 w-56 h-56 rounded-full opacity-15" style={{background: 'radial-gradient(circle, #F42A41 0%, transparent 70%)', filter: 'blur(70px)'}} />
        <div className="absolute bottom-4 right-1/3 w-40 h-40 rounded-full opacity-10" style={{background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', filter: 'blur(50px)'}} />
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🇧🇩</span>
              <div>
                <div className="font-bold text-lg text-white">{t.platformName}</div>
                <div className="text-green-300 text-xs opacity-80">{t.subTitle}</div>
              </div>
            </div>
            <p className="text-green-200 text-xs sm:text-sm leading-relaxed mb-4 opacity-80">
              {t.footerDesc}
            </p>
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#FFD700] rounded-lg text-xs font-bold border cursor-pointer transition-all hover:scale-105"
              style={{background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,215,0,0.35)'}}
            >
              <Globe size={13} /> {lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            </button>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[#FFD700] text-sm tracking-wide uppercase">{t.quickLinks}</h4>
            <ul className="space-y-2 text-green-200 text-xs sm:text-sm">
              <li><Link to="/" className="hover:text-[#FFD700] transition-colors">{t.navHome}</Link></li>
              <li><Link to="/blogs" className="hover:text-[#FFD700] transition-colors">{t.navBlogs}</Link></li>
              <li><Link to="/articles" className="hover:text-[#FFD700] transition-colors">{lang === 'bn' ? '📰 আর্টিকেল' : '📰 Articles'}</Link></li>
              <li><Link to="/ledger" className="hover:text-[#FFD700] transition-colors">{t.navLedger}</Link></li>
              <li><Link to="/analytics" className="hover:text-[#FFD700] transition-colors">{t.navAnalytics}</Link></li>
              <li><Link to="/hierarchy" className="hover:text-[#FFD700] transition-colors">{t.navHierarchy}</Link></li>
              <li><Link to="/about" className="hover:text-[#FFD700] transition-colors">{t.navAbout}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[#FFD700] text-sm tracking-wide uppercase">{t.emergencyHelp}</h4>
            <ul className="space-y-2.5 text-green-200 text-xs sm:text-sm">
              <li>
                <a href="https://www.acc.org.bd" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ExternalLink size={14} /> {t.accWebsite}
                </a>
              </li>
              <li>
                <a href="tel:106" className="text-[#FFD700] font-bold flex items-center gap-1.5">
                  <PhoneCall size={14} /> {t.accHelpline}
                </a>
              </li>
              <li>
                <button onClick={exportToCSV} className="text-emerald-300 hover:text-white hover:underline flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Download size={14} /> {t.fullCsvDownload}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 text-center text-xs" style={{borderColor: 'rgba(255,255,255,0.12)'}}>
          <p className="text-green-300 opacity-70">{t.copyright}</p>
          <p className="mt-1 text-[#FFD700] font-semibold opacity-90 tracking-wide">{t.footerMotto}</p>
          {/* BD flag color accent line at bottom */}
          <div className="mt-4 flex justify-center gap-1">
            <div className="h-1 w-16 rounded-full" style={{background: '#006A4E'}} />
            <div className="h-1 w-8 rounded-full" style={{background: '#F42A41'}} />
            <div className="h-1 w-16 rounded-full" style={{background: '#006A4E'}} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
