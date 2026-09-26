import React, { useState } from 'react';
import { useReports } from '../context/ReportContext';
import { OutcomeBadge } from '../components/ReportCard';
import { ChevronDown, ChevronUp, MapPin, Building, Scale } from 'lucide-react';

const DIVISION_NAMES = {
  'ঢাকা বিভাগ': { bn: 'ঢাকা বিভাগ', en: 'Dhaka Division' },
  'চট্টগ্রাম বিভাগ': { bn: 'চট্টগ্রাম বিভাগ', en: 'Chittagong Division' },
  'রাজশাহী বিভাগ': { bn: 'রাজশাহী বিভাগ', en: 'Rajshahi Division' },
  'খুলনা বিভাগ': { bn: 'খুলনা বিভাগ', en: 'Khulna Division' },
  'বরিশাল বিভাগ': { bn: 'বরিশাল বিভাগ', en: 'Barisal Division' },
  'সিলেট বিভাগ': { bn: 'সিলেট বিভাগ', en: 'Sylhet Division' },
  'রংপুর বিভাগ': { bn: 'রংপুর বিভাগ', en: 'Rangpur Division' },
  'ময়মনসিংহ বিভাগ': { bn: 'ময়মনসিংহ বিভাগ', en: 'Mymensingh Division' }
};

const Hierarchy = () => {
  const { reports, setSelectedReport, t, lang } = useReports();
  const [openDivision, setOpenDivision] = useState({});

  // Tree: Division -> District -> Thana -> Office -> Reports
  const tree = {};
  reports.forEach(b => {
    if (!tree[b.division]) tree[b.division] = {};
    if (!tree[b.division][b.district]) tree[b.division][b.district] = {};
    if (!tree[b.division][b.district][b.thana]) tree[b.division][b.district][b.thana] = {};
    if (!tree[b.division][b.district][b.thana][b.office]) tree[b.division][b.district][b.thana][b.office] = [];
    tree[b.division][b.district][b.thana][b.office].push(b);
  });

  const toggleDivision = (division) => {
    setOpenDivision(prev => ({ ...prev, [division]: !prev[division] }));
  };

  return (
    <div>
      <div className="bg-[#006A4E] py-12 px-4 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2">{t.hierarchyTitle}</h1>
        <p className="text-green-200 text-sm">{t.hierarchySubtitle}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-4">
        {Object.entries(tree).map(([division, dists]) => {
          const divReports = reports.filter(r => r.division === division);
          const divTotal = divReports.length;
          const divAmount = divReports.reduce((acc, r) => acc + r.amount, 0);
          const isOpen = !!openDivision[division];
          const translatedDivision = DIVISION_NAMES[division]?.[lang] || division;

          return (
            <div key={division} className="border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleDivision(division)}
                className="w-full px-5 py-4 bg-[#e8f5f0] hover:bg-green-100 text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🗺️</span>
                  <div>
                    <span className="font-bold text-[#004d38] text-base">{translatedDivision}</span>
                    <span className="text-xs font-mono text-gray-500 ml-2">
                      ({divTotal} {t.reportsCountLabel} • {lang === 'bn' ? 'মোট দাবি' : 'Total Demanded'}: ৳{divAmount.toLocaleString('en-US')})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#006A4E]">
                  {isOpen ? t.collapse : t.expand}
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isOpen && (
                <div className="p-5 bg-slate-50 border-t border-gray-200 space-y-4">
                  {Object.entries(dists).map(([district, thanas]) => {
                    const distTotal = reports.filter(r => r.division === division && r.district === district).length;

                    return (
                      <div key={district} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <div className="font-bold text-sm text-gray-900 mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#006A4E]">
                            <MapPin size={14} /> {t.districtLabel}: {district}
                          </span>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {distTotal} {t.reportsCountLabel}
                          </span>
                        </div>

                        <div className="space-y-3 mt-3">
                          {Object.entries(thanas).map(([thana, offices]) => (
                            <div key={thana} className="ml-2 sm:ml-4 border-l-2 border-[#006A4E] pl-3">
                              <div className="font-bold text-xs text-[#004d38] mb-2">
                                🏘️ {t.thanaLabel}: {thana || (lang === 'bn' ? 'অনির্দিষ্ট' : 'General')}
                              </div>

                              <div className="space-y-2">
                                {Object.entries(offices).map(([office, items]) => (
                                  <div key={office} className="ml-2">
                                    <div className="font-bold text-xs text-gray-800 mb-1.5 flex items-center gap-1.5">
                                      <Building size={12} className="text-gray-500" />
                                      {office} 
                                      <span className="text-[11px] font-mono text-gray-400">({items.length} {t.reportsCountLabel})</span>
                                    </div>

                                    <div className="space-y-2">
                                      {items.map(item => (
                                        <div
                                          key={item.id}
                                          onClick={() => setSelectedReport(item)}
                                          className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs cursor-pointer hover:bg-green-50 transition-colors"
                                        >
                                          <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-800">{item.title}</span>
                                            <span className="font-mono font-bold text-[#F42A41]">
                                              ৳{item.amount.toLocaleString('en-US')}
                                            </span>
                                          </div>
                                          <p className="text-gray-500 line-clamp-2 mb-1.5">{item.content}</p>
                                          <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                                            <span className="text-[#F42A41] font-semibold flex items-center gap-1">
                                              <Scale size={11} /> {item.official || t.officerUnstated} {item.officialPost ? `(${item.officialPost})` : ''}
                                            </span>
                                            <OutcomeBadge outcome={item.outcome} lang={lang} />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hierarchy;
