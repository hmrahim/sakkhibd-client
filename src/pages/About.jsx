import React from 'react';
import { useReports } from '../context/ReportContext';
import { Shield, Lock, FileCheck, PhoneCall, Globe, Download } from 'lucide-react';

const About = () => {
  const { exportToCSV, t } = useReports();

  return (
    <div>
      <div className="bg-[#006A4E] py-12 px-4 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2">{t.aboutTitle}</h1>
        <p className="text-green-200 text-sm">{t.aboutSubtitle}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 space-y-8">
        {/* Mission Statement */}
        <div className="bg-white rounded-3xl shadow p-8 border border-gray-100">
          <h2 className="text-2xl font-extrabold text-[#006A4E] mb-4 flex items-center gap-2">
            {t.missionTitle}
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            {t.missionText}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#e8f5f0] rounded-3xl p-6 border border-green-100">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#006A4E] shadow-sm mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#006A4E] mb-2">{t.safeTitle}</h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              {t.safeText}
            </p>
          </div>

          <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#F42A41] shadow-sm mb-4">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#F42A41] mb-2">{t.openDataTitle}</h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              {t.openDataText}
            </p>
          </div>
        </div>

        {/* Terms of Use */}
        <div className="bg-white rounded-3xl shadow p-8 border border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <FileCheck className="text-[#006A4E]" size={24} /> {t.rulesTitle}
          </h2>
          <ul className="space-y-3 text-gray-600 text-xs sm:text-sm">
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">✅</span>
              <span>{t.rule1}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">✅</span>
              <span>{t.rule2}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">✅</span>
              <span>{t.rule3}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">❌</span>
              <span>{t.rule4}</span>
            </li>
          </ul>
        </div>

        {/* Helpline Card */}
        <div className="bg-[#006A4E] text-white rounded-3xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-2">{t.helplineCardTitle}</h3>
          <p className="text-green-200 text-sm mb-6">
            {t.helplineCardSub}
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-xs sm:text-sm">
            <a href="tel:106" className="bg-[#F42A41] hover:bg-[#c0172c] text-white px-6 py-3 rounded-full font-bold shadow flex items-center gap-2 no-underline">
              <PhoneCall size={16} /> {t.accHotlineBtn}
            </a>
            <a href="https://www.acc.org.bd" target="_blank" rel="noopener noreferrer" className="bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-full border border-white/20 flex items-center gap-2 no-underline">
              <Globe size={16} /> acc.org.bd
            </a>
            <button onClick={exportToCSV} className="bg-[#FFD700] hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 cursor-pointer shadow">
              <Download size={16} /> {t.downloadDatasetBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
