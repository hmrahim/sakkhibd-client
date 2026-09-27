import React, { useMemo, useState } from 'react';
import { useReports } from '../context/ReportContext';
import { OutcomeBadge } from '../components/ReportCard';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Building,
  Scale,
  Search,
  X,
  Landmark,
  ArrowUpDown,
  ChevronsUpDown,
  FileText,
  Wallet,
  Award,
} from 'lucide-react';

const DIVISION_NAMES = {
  'ঢাকা বিভাগ': { bn: 'ঢাকা বিভাগ', en: 'Dhaka Division' },
  'চট্টগ্রাম বিভাগ': { bn: 'চট্টগ্রাম বিভাগ', en: 'Chittagong Division' },
  'রাজশাহী বিভাগ': { bn: 'রাজশাহী বিভাগ', en: 'Rajshahi Division' },
  'খুলনা বিভাগ': { bn: 'খুলনা বিভাগ', en: 'Khulna Division' },
  'বরিশাল বিভাগ': { bn: 'বরিশাল বিভাগ', en: 'Barisal Division' },
  'সিলেট বিভাগ': { bn: 'সিলেট বিভাগ', en: 'Sylhet Division' },
  'রংপুর বিভাগ': { bn: 'রংপুর বিভাগ', en: 'Rangpur Division' },
  'ময়মনসিংহ বিভাগ': { bn: 'ময়মনসিংহ বিভাগ', en: 'Mymensingh Division' },
};

const RANK_STYLES = [
  { ring: 'ring-2 ring-[#FFD700]', badge: 'bg-gradient-to-br from-[#FFD700] to-[#c9960a] text-white', bar: 'from-[#FFD700] to-[#c9960a]' },
  { ring: 'ring-2 ring-slate-300', badge: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white', bar: 'from-slate-300 to-slate-500' },
  { ring: 'ring-2 ring-[#cd7f32]/60', badge: 'bg-gradient-to-br from-[#cd7f32] to-[#8a5322] text-white', bar: 'from-[#cd7f32] to-[#8a5322]' },
];

const SORT_OPTIONS = (lang) => ([
  { id: 'amount', label: lang === 'bn' ? 'অর্থের পরিমাণ' : 'Amount' },
  { id: 'count', label: lang === 'bn' ? 'রিপোর্ট সংখ্যা' : 'Report Count' },
  { id: 'az', label: lang === 'bn' ? 'নাম (আ-জ)' : 'Name (A-Z)' },
]);

const norm = (v) => (v ?? '').toString().toLowerCase();

const Hierarchy = () => {
  const { reports, setSelectedReport, t, lang } = useReports();
  const [openDivision, setOpenDivision] = useState({});
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('amount');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const searchActive = query.trim().length > 0;

  const filteredReports = useMemo(() => {
    if (!searchActive) return reports;
    const q = norm(query);
    return reports.filter((r) => {
      const translated = DIVISION_NAMES[r.division]?.[lang] || r.division;
      return [r.title, r.content, r.official, r.officialPost, r.office, r.thana, r.district, r.division, translated]
        .some((f) => norm(f).includes(q));
    });
  }, [reports, query, lang, searchActive]);

  // Tree: Division -> District -> Thana -> Office -> Reports
  const tree = useMemo(() => {
    const t = {};
    filteredReports.forEach((b) => {
      if (!t[b.division]) t[b.division] = {};
      if (!t[b.division][b.district]) t[b.division][b.district] = {};
      if (!t[b.division][b.district][b.thana]) t[b.division][b.district][b.thana] = {};
      if (!t[b.division][b.district][b.thana][b.office]) t[b.division][b.district][b.thana][b.office] = [];
      t[b.division][b.district][b.thana][b.office].push(b);
    });
    return t;
  }, [filteredReports]);

  const divisionStats = useMemo(() => {
    const stats = Object.keys(tree).map((division) => {
      const divReports = filteredReports.filter((r) => r.division === division);
      const districtCount = new Set(divReports.map((r) => r.district)).size;
      return {
        division,
        name: DIVISION_NAMES[division]?.[lang] || division,
        total: divReports.length,
        amount: divReports.reduce((acc, r) => acc + r.amount, 0),
        districtCount,
      };
    });

    const sorters = {
      amount: (a, b) => b.amount - a.amount,
      count: (a, b) => b.total - a.total,
      az: (a, b) => a.name.localeCompare(b.name, lang === 'bn' ? 'bn' : 'en'),
    };
    return stats.sort(sorters[sortMode]);
  }, [tree, filteredReports, lang, sortMode]);

  const maxAmount = Math.max(1, ...divisionStats.map((d) => d.amount));

  const overallStats = useMemo(() => ({
    reports: reports.length,
    amount: reports.reduce((acc, r) => acc + r.amount, 0),
    divisions: new Set(reports.map((r) => r.division)).size,
  }), [reports]);

  const toggleDivision = (division) => {
    setOpenDivision((prev) => ({ ...prev, [division]: !prev[division] }));
  };

  const expandAll = () => {
    const all = {};
    divisionStats.forEach((d) => { all[d.division] = true; });
    setOpenDivision(all);
  };
  const collapseAll = () => setOpenDivision({});

  const isDivisionOpen = (division) => searchActive || !!openDivision[division];

  const fmt = (n) => `৳${n.toLocaleString('en-US')}`;

  return (
    <div>
      {/* HERO */}
      <div className="hero-bg py-14 px-4 text-white text-center relative">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-4">
            <Landmark size={28} className="text-brand-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">{t.hierarchyTitle}</h1>
          <p className="text-green-100/80 text-sm sm:text-base max-w-2xl mx-auto">{t.hierarchySubtitle}</p>

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-xl mx-auto">
            <div className="stat-glass rounded-2xl px-3 py-4">
              <div className="text-2xl font-extrabold mono-num">{overallStats.divisions}</div>
              <div className="text-[11px] text-green-100/70 mt-1">{lang === 'bn' ? 'বিভাগ' : 'Divisions'}</div>
            </div>
            <div className="stat-glass rounded-2xl px-3 py-4">
              <div className="text-2xl font-extrabold mono-num">{overallStats.reports.toLocaleString('en-US')}</div>
              <div className="text-[11px] text-green-100/70 mt-1">{t.statTotalReports}</div>
            </div>
            <div className="stat-glass rounded-2xl px-3 py-4">
              <div className="text-lg sm:text-2xl font-extrabold mono-num text-brand-gold">{fmt(overallStats.amount)}</div>
              <div className="text-[11px] text-green-100/70 mt-1">{t.statTotalAmount}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flag-stripe" />

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sticky top-2 z-20">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder || (lang === 'bn' ? 'বিভাগ, জেলা, থানা, প্রতিষ্ঠান বা কর্মকর্তা খুঁজুন...' : 'Search division, district, thana, office or official...')}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-2xl pl-10 pr-9 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] transition-all"
            />
            {searchActive && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3 text-xs font-bold text-gray-700 hover:border-[#006A4E]/40 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowUpDown size={14} className="text-[#006A4E]" />
                {SORT_OPTIONS(lang).find((o) => o.id === sortMode)?.label}
              </button>
              {sortMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in z-30">
                  {SORT_OPTIONS(lang).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setSortMode(opt.id); setSortMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${sortMode === opt.id ? 'bg-[#e8f5f0] text-[#006A4E]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => (Object.keys(openDivision).length ? collapseAll() : expandAll())}
              className="flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm rounded-2xl px-3.5 py-3 text-xs font-bold text-gray-700 hover:border-[#006A4E]/40 transition-colors cursor-pointer"
              title={lang === 'bn' ? 'সব প্রসারিত/সংকুচিত করুন' : 'Expand/Collapse all'}
            >
              <ChevronsUpDown size={14} className="text-[#006A4E]" />
            </button>
          </div>
        </div>

        {searchActive && (
          <div className="text-xs text-gray-500 mb-4 px-1">
            {lang === 'bn'
              ? `"${query}" এর জন্য ${filteredReports.length} টি রিপোর্ট পাওয়া গেছে`
              : `${filteredReports.length} reports found for "${query}"`}
          </div>
        )}

        {/* DIVISION LIST */}
        <div className="space-y-4">
          {divisionStats.map((stat, idx) => {
            const { division, name, total, amount, districtCount } = stat;
            const dists = tree[division];
            const isOpen = isDivisionOpen(division);
            const rankStyle = sortMode === 'amount' && idx < 3 ? RANK_STYLES[idx] : null;
            const barPct = Math.max(4, Math.round((amount / maxAmount) * 100));

            return (
              <div
                key={division}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 transition-shadow ${rankStyle ? rankStyle.ring : ''} ${isOpen ? 'shadow-md' : 'card-hover'}`}
              >
                <button
                  onClick={() => toggleDivision(division)}
                  disabled={searchActive}
                  className="w-full px-4 sm:px-5 py-4 bg-white hover:bg-[#e8f5f0]/60 text-left flex items-center gap-3 sm:gap-4 transition-colors cursor-pointer disabled:cursor-default"
                >
                  <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs mono-num ${rankStyle ? rankStyle.badge : 'bg-[#e8f5f0] text-[#006A4E]'}`}>
                    {rankStyle ? <Award size={16} /> : `#${idx + 1}`}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#004d38] text-sm sm:text-base truncate">{name}</span>
                      <span className="font-extrabold mono-num text-[#F42A41] text-sm sm:text-base whitespace-nowrap">{fmt(amount)}</span>
                    </div>
                    <div className="progress-track mt-2">
                      <div
                        className={`progress-fill bg-gradient-to-r ${rankStyle ? rankStyle.bar : 'from-[#006A4E] to-[#004d38]'}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1"><FileText size={11} /> {total} {t.reportsCountLabel}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {districtCount} {lang === 'bn' ? 'জেলা' : 'districts'}</span>
                    </div>
                  </div>

                  {!searchActive && (
                    <div className="shrink-0 text-gray-400">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 bg-slate-50 border-t border-gray-200 space-y-3 animate-fade-in">
                    {Object.entries(dists).map(([district, thanas]) => {
                      const distReports = filteredReports.filter((r) => r.division === division && r.district === district);
                      const distTotal = distReports.length;
                      const distAmount = distReports.reduce((acc, r) => acc + r.amount, 0);

                      return (
                        <div key={district} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <div className="font-bold text-sm text-gray-900 mb-3 flex items-center justify-between flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 text-[#006A4E]">
                              <MapPin size={14} /> {t.districtLabel}: {district}
                            </span>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                {distTotal} {t.reportsCountLabel}
                              </span>
                              <span className="font-mono bg-red-50 text-[#c0172c] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Wallet size={10} /> {fmt(distAmount)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {Object.entries(thanas).map(([thana, offices]) => (
                              <div key={thana} className="relative ml-1 sm:ml-2 pl-4 border-l-2 border-dashed border-[#006A4E]/40">
                                <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#006A4E]" />
                                <div className="font-bold text-xs text-[#004d38] mb-2 flex items-center gap-1.5">
                                  🏘️ {t.thanaLabel}: {thana || (lang === 'bn' ? 'অনির্দিষ্ট' : 'General')}
                                </div>

                                <div className="space-y-2.5">
                                  {Object.entries(offices).map(([office, items]) => (
                                    <div key={office} className="ml-1 sm:ml-2">
                                      <div className="font-bold text-xs text-gray-800 mb-1.5 flex items-center gap-1.5">
                                        <Building size={12} className="text-gray-500" />
                                        {office}
                                        <span className="text-[11px] font-mono text-gray-400">({items.length} {t.reportsCountLabel})</span>
                                      </div>

                                      <div className="grid gap-2 sm:grid-cols-2">
                                        {items.map((item) => (
                                          <div
                                            key={item.id}
                                            onClick={() => setSelectedReport(item)}
                                            className="group bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs cursor-pointer hover:bg-[#e8f5f0] hover:border-[#006A4E]/40 hover:-translate-y-0.5 transition-all duration-200"
                                          >
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                              <span className="font-bold text-gray-800 line-clamp-1">{item.title}</span>
                                              <span className="font-mono font-bold text-[#F42A41] whitespace-nowrap">
                                                {fmt(item.amount)}
                                              </span>
                                            </div>
                                            <p className="text-gray-500 line-clamp-2 mb-1.5">{item.content}</p>
                                            <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1.5 border-t border-gray-200/70">
                                              <span className="text-[#F42A41] font-semibold flex items-center gap-1 truncate">
                                                <Scale size={11} className="shrink-0" /> {item.official || t.officerUnstated} {item.officialPost ? `(${item.officialPost})` : ''}
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

          {divisionStats.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <Search size={28} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm font-semibold">
                {lang === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No results found'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {lang === 'bn' ? 'অন্য কোনো কীওয়ার্ড দিয়ে চেষ্টা করুন' : 'Try a different search term'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;