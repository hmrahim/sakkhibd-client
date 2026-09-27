import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useReports } from '../context/ReportContext';
import { getReportsApi } from '../api/reportApi';
import ReportCard from '../components/ReportCard';
import CorruptionBribeAnimation from '../components/CorruptionBribeAnimation';
import { DIVISION_DISTRICTS } from '../data/initialData';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { PlusCircle, BarChart3, Newspaper, ArrowRight, Filter, Search, RotateCcw, Loader2 } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Normalize a raw report coming straight from the backend so it has the
// same shape the rest of the UI (ReportCard / DetailModal) expects.
const normalizeReport = (r) => ({
  ...r,
  id: r.id || r._id,
  reactions: r.reactions || { like: r.likes || 0, love: 0, angry: 0, sad: 0, wow: 0 },
  userReaction: r.userReaction || null,
  comments: r.comments || [],
  commentsCount: r.commentsCount ?? (r.comments || []).length,
  photos: r.proofImages || r.photos || [],
});

const Home = () => {
  const { reports, setIsSubmitModalOpen, t, lang } = useReports();

  // Location-based filters for Home page blogs
  const [homeDivision, setHomeDivision] = useState('');
  const [homeDistrict, setHomeDistrict] = useState('');
  const [homeThana, setHomeThana] = useState('');
  const [homeSearch, setHomeSearch] = useState('');

  // Debounce the free-text fields so we don't hit the backend on every keystroke
  const debouncedHomeSearch = useDebouncedValue(homeSearch, 400);
  const debouncedHomeThana = useDebouncedValue(homeThana, 400);

  const hasActiveHomeFilters = !!(homeDivision || homeDistrict || homeThana || homeSearch);

  // Backend query params built from the current filter selections
  const homeFilterParams = useMemo(() => {
    const params = { limit: 60, sortBy: 'createdAt', order: 'desc' };
    if (debouncedHomeSearch.trim()) params.search = debouncedHomeSearch.trim();
    if (homeDivision) params.division = homeDivision;
    if (homeDistrict) params.district = homeDistrict;
    if (debouncedHomeThana.trim()) params.thana = debouncedHomeThana.trim();
    return params;
  }, [debouncedHomeSearch, homeDivision, homeDistrict, debouncedHomeThana]);

  // Dynamic, server-side filtering — runs against the FULL dataset in the
  // database, not just the reports already cached on the client.
  const {
    data: homeFilteredData,
    isFetching: isHomeFilterLoading,
  } = useQuery({
    queryKey: ['reports', 'home-filtered', homeFilterParams],
    queryFn: async () => {
      const res = await getReportsApi(homeFilterParams);
      return res?.data || [];
    },
    enabled: hasActiveHomeFilters,
    staleTime: 1000 * 20,
  });

  const totalReports = reports.length;
  const totalAmount = reports.reduce((acc, r) => acc + r.amount, 0);
  const refusedCount = reports.filter(r => r.outcome === 'প্রত্যাখ্যাত' || r.outcome === 'Refused').length;
  const refusalPct = totalReports ? Math.round((refusedCount / totalReports) * 100) : 0;
  const districtsCount = new Set(reports.map(r => r.district)).size;

  const categories = [
    { key: 'ভূমি অফিস', emoji: '🏚️', label: lang === 'bn' ? 'ভূমি অফিস' : 'Land Office', sub: 'Land Office' },
    { key: 'পাসপোর্ট অফিস', emoji: '🛂', label: lang === 'bn' ? 'পাসপোর্ট অফিস' : 'Passport Office', sub: 'Passport' },
    { key: 'বিআরটিএ', emoji: '🚗', label: lang === 'bn' ? 'বিআরটিএ' : 'BRTA', sub: 'BRTA' },
    { key: 'ট্রাফিক পুলিশ', emoji: '🚔', label: lang === 'bn' ? 'ট্রাফিক পুলিশ' : 'Traffic Police', sub: 'Police' },
    { key: 'কাস্টমস অফিস', emoji: '🚢', label: lang === 'bn' ? 'কাস্টমস' : 'Customs', sub: 'Customs' },
    { key: 'কর ও ভ্যাট অফিস', emoji: '💰', label: lang === 'bn' ? 'কর ও ভ্যাট' : 'Tax & VAT', sub: 'Tax & VAT' },
    { key: 'সিটি কর্পোরেশন', emoji: '🏛️', label: lang === 'bn' ? 'সিটি কর্পোরেশন' : 'City Corporation', sub: 'City Corp' },
    { key: 'সরকারি হাসপাতাল', emoji: '🏥', label: lang === 'bn' ? 'হাসপাতাল' : 'Govt Hospital', sub: 'Hospital' },
  ];

  const categoryCounts = {};
  reports.forEach(r => { categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1; });

  // Mini Division Chart Data
  const divCounts = {};
  reports.forEach(r => { divCounts[r.division] = (divCounts[r.division] || 0) + 1; });
  const divLabels = Object.keys(divCounts).map(d => d.replace(' বিভাগ', ''));

  const miniDivData = {
    labels: divLabels,
    datasets: [{
      data: Object.values(divCounts),
      backgroundColor: '#006A4E',
      borderRadius: 6
    }]
  };

  // Mini Outcome Chart Data
  const pCount = reports.filter(b => b.outcome === 'পরিশোধিত' || b.outcome === 'Paid').length;
  const rCount = reports.filter(b => b.outcome === 'প্রত্যাখ্যাত' || b.outcome === 'Refused').length;
  const mCount = reports.filter(b => b.outcome === 'দাবি মুলতুবি' || b.outcome === 'ভুক্তভোগী' || b.outcome === 'Pending').length;

  const miniOutcomeData = {
    labels: lang === 'bn' ? ['পরিশোধিত', 'প্রত্যাখ্যাত', 'মুলতুবি/ভুক্তভোগী'] : ['Paid', 'Refused', 'Pending/Victim'],
    datasets: [{
      data: [pCount, rCount, mCount],
      backgroundColor: ['#F42A41', '#006A4E', '#f59e0b']
    }]
  };

  // Dynamic districts based on chosen division
  const availableDistricts = homeDivision ? (DIVISION_DISTRICTS[homeDivision] || []) : [];

  // Reports for the Home Page listing:
  // - No filters active -> just show the already-loaded reports (unchanged behaviour)
  // - Any filter active -> use the backend's own filtered result set, so
  //   users can find matches across the entire database, not only the
  //   subset already cached on the client.
  const filteredHomeReports = useMemo(() => {
    if (hasActiveHomeFilters) {
      return (homeFilteredData || []).map(normalizeReport);
    }
    return reports;
  }, [hasActiveHomeFilters, homeFilteredData, reports]);

  const resetFilters = () => {
    setHomeDivision('');
    setHomeDistrict('');
    setHomeThana('');
    setHomeSearch('');
  };

  // Home page only ever teases a preview of the reports (3 per row × 4 rows).
  // The full list always lives on the Complaints page (/blogs).
  const HOME_REPORTS_LIMIT = 12;
  const homeReportsToShow = filteredHomeReports.slice(0, HOME_REPORTS_LIMIT);
  const hasMoreThanHomeLimit = filteredHomeReports.length > HOME_REPORTS_LIMIT;

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-bg text-white py-16 sm:py-24 px-4 relative overflow-hidden min-h-[440px] flex items-center justify-center">
        {/* Anti-Corruption Bribery Exchange Animation Backdrop */}
        <CorruptionBribeAnimation />

        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-5 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#F42A41] opacity-15 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {t.heroBadge}
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            {t.heroTitle1}<br />
            <span className="text-[#FFD700]">{t.heroTitle2}</span>
          </h1>
          <p className="text-green-100 text-base sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.heroDesc}<br />
            <strong className="text-white">{t.heroDescBold}</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-[#F42A41] hover:bg-[#c0172c] text-white px-8 py-4 rounded-full text-base sm:text-lg font-bold transition-all shadow-xl flex items-center gap-2 justify-center cursor-pointer"
            >
              <PlusCircle size={20} /> {t.reportBribeBtnHero}
            </button>
            <Link
              to="/blogs"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-8 py-4 rounded-full text-base sm:text-lg font-semibold transition-all backdrop-blur flex items-center gap-2 justify-center no-underline"
            >
              <Newspaper size={20} /> {t.allBlogsBtn}
            </Link>
            <Link
              to="/analytics"
              className="bg-[#FFD700] hover:bg-yellow-400 text-gray-900 px-6 py-4 rounded-full text-base font-bold transition-all shadow-lg flex items-center gap-2 justify-center no-underline"
            >
              <BarChart3 size={20} /> {t.analyticsBtn}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Transparency Ledger Section ── */}
      {(() => {
        const divisionsCount = new Set(reports.map(r => r.division).filter(Boolean)).size;
        const amounts = reports.map(r => parseFloat(r.amount) || 0).filter(a => a > 0);
        const maxAmount = amounts.length ? Math.max(...amounts) : 0;
        const avgAmount = amounts.length ? amounts.reduce((s, a) => s + a, 0) / amounts.length : 0;
        const divMap = {};
        reports.forEach(r => { if (r.division) divMap[r.division] = (divMap[r.division] || 0) + 1; });
        const topDivision = Object.entries(divMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
        
        const divisionNameMap = {
          'ঢাকা বিভাগ': { bn: 'ঢাকা', en: 'Dhaka' },
          'চট্টগ্রাম বিভাগ': { bn: 'চট্টগ্রাম', en: 'Chittagong' },
          'রাজশাহী বিভাগ': { bn: 'রাজশাহী', en: 'Rajshahi' },
          'খুলনা বিভাগ': { bn: 'খুলনা', en: 'Khulna' },
          'বরিশাল বিভাগ': { bn: 'বরিশাল', en: 'Barisal' },
          'সিলেট বিভাগ': { bn: 'সিলেট', en: 'Sylhet' },
          'রংপুর বিভাগ': { bn: 'রংপুর', en: 'Rangpur' },
          'ময়মনসিংহ বিভাগ': { bn: 'ময়মনসিংহ', en: 'Mymensingh' }
        };

        const topDivisionDisplay = divisionNameMap[topDivision]?.[lang] 
          || (lang === 'en' ? topDivision.replace(' বিভাগ', '') : topDivision.replace(' বিভাগ', ''));

        const formatAmount = (val) => {
          if (lang === 'bn') {
            if (val >= 10000000) return `৳${(val / 10000000).toFixed(1)} কোটি`;
            if (val >= 100000)   return `৳${(val / 100000).toFixed(2)} লাখ`;
            if (val >= 1000)     return `৳${(val / 1000).toFixed(1)}K`;
            return `৳${Math.round(val).toLocaleString('en-US')}`;
          } else {
            if (val >= 10000000) return `৳${(val / 10000000).toFixed(1)} Crore`;
            if (val >= 100000)   return `৳${(val / 100000).toFixed(2)} Lakh`;
            if (val >= 1000)     return `৳${(val / 1000).toFixed(1)}K`;
            return `৳${Math.round(val).toLocaleString('en-US')}`;
          }
        };

        const ledgerStats = [
          {
            value: reports.length.toLocaleString('en-US'),
            label: t.lStatPublicReports,
            subLabel: t.lStatPublicReportsBn,
            icon: '📋',
            color: '#FFD700',
            desc: t.lStatPublicReportsDesc,
          },
          {
            value: String(divisionsCount).padStart(2, '0'),
            label: t.lStatDivisions,
            subLabel: t.lStatDivisionsBn,
            icon: '🗺️',
            color: '#10b981',
            desc: t.lStatDivisionsDesc,
          },
          {
            value: formatAmount(maxAmount),
            label: t.lStatLargest,
            subLabel: t.lStatLargestBn,
            icon: '📈',
            color: '#F42A41',
            desc: t.lStatLargestDesc,
          },
          {
            value: formatAmount(avgAmount),
            label: t.lStatAverage,
            subLabel: t.lStatAverageBn,
            icon: '⚖️',
            color: '#a855f7',
            desc: t.lStatAverageDesc,
          },
          {
            value: topDivisionDisplay,
            label: t.lStatTopDiv,
            subLabel: t.lStatTopDivBn,
            icon: '📍',
            color: '#f97316',
            desc: `${divMap[topDivision] || 0} ${lang === 'bn' ? 'টি রিপোর্ট এই অঞ্চল থেকে' : 'reports from this region'}`,
          },
          {
            value: `${refusalPct}%`,
            label: t.lStatRefusal,
            subLabel: t.lStatRefusalBn,
            icon: '🛡️',
            color: '#22c55e',
            desc: t.lStatRefusalDesc,
          },
        ];

        return (
          <div className="relative overflow-hidden py-20 px-4 bg-[#f1f5f1] border-t border-gray-100">

            <div className="max-w-7xl mx-auto relative z-10">

              {/* Section Header */}
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-5"
                  style={{ borderColor: 'rgba(0,106,78,0.25)', background: 'rgba(0,106,78,0.06)', color: '#006A4E' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {t.ledgerBadge}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {t.ledgerSectionTitle1}{' '}
                  <span style={{ background: 'linear-gradient(90deg, #006A4E, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t.ledgerSectionTitle2}
                  </span>
                </h2>
                <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  {t.ledgerSectionDesc}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {ledgerStats.map((stat, i) => (
                  <div key={i}
                    className="group relative rounded-2xl p-6 border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default"
                    style={{ borderColor: `${stat.color}30` }}>

                    {/* Top accent line */}
                    <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${stat.color}80, transparent)` }} />

                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${stat.color}15` }}>
                        {stat.icon}
                      </div>
                      <div className="text-[10px] font-bold tracking-widest uppercase text-right leading-tight max-w-[130px]"
                        style={{ color: stat.color }}>
                        {stat.label}
                      </div>
                    </div>

                    <div className="mt-1">
                      <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mono-num leading-none mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs font-semibold mt-2" style={{ color: stat.color }}>
                        {stat.subLabel}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                        {stat.desc}
                      </div>
                    </div>

                    {/* Bottom accent on hover */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl"
                      style={{ background: `linear-gradient(90deg, transparent, ${stat.color}70, transparent)` }} />
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <div className="mt-10 text-center">
                <p className="text-gray-400 text-xs tracking-wide">
                  {t.ledgerFooterNote}
                </p>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Amount Distribution & Outcomes Section ── */}
      {(() => {
        const amounts = reports.map(r => parseFloat(r.amount) || 0).filter(a => a > 0);
        const total = reports.length || 1;

        const buckets = [
          { label: t.amountBucket1, min: 0,     max: 1000,    color: '#10b981' },
          { label: t.amountBucket2, min: 1001,  max: 5000,    color: '#3b82f6' },
          { label: t.amountBucket3, min: 5001,  max: 10000,   color: '#f59e0b' },
          { label: t.amountBucket4, min: 10001, max: Infinity, color: '#F42A41' },
        ].map(b => {
          const count = amounts.filter(a => a >= b.min && a <= b.max).length;
          return { ...b, count, pct: Math.round((count / total) * 100) };
        });

        const pCount = reports.filter(r => r.outcome === 'পরিশোধিত' || r.outcome === 'Paid').length;
        const rCount = reports.filter(r => r.outcome === 'প্রত্যাখ্যাত' || r.outcome === 'Refused').length;
        const mCount = reports.filter(r =>
          r.outcome === 'দাবি মুলতুবি' || r.outcome === 'ভুক্তভোগী' || r.outcome === 'Pending'
        ).length;

        const outcomes = [
          { label: t.outcomePaid, count: pCount, color: '#F42A41', icon: '💸' },
          { label: t.outcomeRefused, count: rCount, color: '#10b981', icon: '✋' },
          { label: t.outcomePending, count: mCount, color: '#f59e0b', icon: '⏳' },
        ];
        const maxOutcome = Math.max(pCount, rCount, mCount, 1);
        const resolvedCount = pCount + rCount;
        const refusalOfResolved = resolvedCount ? Math.round((rCount / resolvedCount) * 100) : 0;

        return (
          <div className="bg-[#f1f5f1] py-16 px-4 border-t border-gray-200">
            <div className="max-w-6xl mx-auto">

              {/* Header */}
              <div className="text-center mb-12">
                <p className="text-xs font-bold text-[#006A4E] uppercase tracking-widest mb-2">{t.dataByNumbers}</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {t.dataShowsTitle}
                </h2>
                <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
                  {t.dataShowsDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── LEFT: Amount Distribution ── */}
                <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                  <div className="mb-6">
                    <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#006A4E] mb-1">
                      {t.amountDistLabel}
                    </p>
                    <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                      {t.amountDistQ}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{t.amountDistNote}</p>
                  </div>

                  <div className="space-y-5">
                    {buckets.map((b, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="text-sm font-semibold text-gray-800">{b.label}</span>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <span className="text-sm font-extrabold text-gray-900 mono-num">{b.count.toLocaleString('en-US')}</span>
                            <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: `${b.color}18`, color: b.color }}>
                              {b.pct}%
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${b.pct}%`, background: b.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {lang === 'bn' ? (
                        <>মোট <strong className="text-gray-700">{amounts.length.toLocaleString('en-US')}</strong> {t.amountFooter}</>
                      ) : (
                        <>Based on <strong className="text-gray-700">{amounts.length.toLocaleString('en-US')}</strong> {t.amountFooter}</>
                      )}
                    </span>
                    <span className="font-bold text-[#006A4E]">100%</span>
                  </div>
                </div>

                {/* ── RIGHT: Reported Outcomes ── */}
                <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                  <div className="mb-6">
                    <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#006A4E] mb-1">
                      {t.outcomeLabel}
                    </p>
                    <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                      {t.outcomeQ}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{t.outcomeNote}</p>
                  </div>

                  <div className="space-y-5">
                    {outcomes.map((o, i) => {
                      const pct = Math.round((o.count / total) * 100);
                      const barW = Math.round((o.count / maxOutcome) * 100);
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{o.icon}</span>
                              <div>
                                <span className="text-sm font-semibold text-gray-800">{o.label}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="text-sm font-extrabold text-gray-900 mono-num">{o.count.toLocaleString('en-US')}</span>
                              <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: `${o.color}18`, color: o.color }}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                          {/* Progress bar — relative to max */}
                          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${barW}%`, background: o.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Callout box */}
                  <div className="mt-6 rounded-2xl p-4 border flex items-start gap-3"
                    style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: 'rgba(16,185,129,0.12)' }}>
                      ✋
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">
                        {lang === 'bn' ? (
                          <>
                            {t.refusalCallout} <span className="text-[#10b981]">{refusalOfResolved}%</span> {t.refusalCalloutSuffix}
                          </>
                        ) : (
                          <>
                            <span className="text-[#10b981]">{refusalOfResolved}%</span> {t.refusalCallout}
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {t.refusalExclude}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Live Blog & Complaints Section with Filters */}
      <div className="bg-slate-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#006A4E] uppercase tracking-wider flex items-center gap-1.5">
                <Newspaper size={15} /> {t.blogSectionBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                {t.blogSectionTitle}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {t.blogSectionDesc}
              </p>
            </div>

            <Link to="/blogs" className="text-[#006A4E] font-bold text-sm hover:underline flex items-center gap-1 shrink-0">
              {t.viewAllLink} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Filtering Box */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-700 uppercase">
              <Filter size={14} className="text-[#006A4E]" />
              {t.filterBoxTitle}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={homeSearch}
                  onChange={(e) => setHomeSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E]"
                />
              </div>

              {/* Division Dropdown */}
              <div>
                <select
                  value={homeDivision}
                  onChange={(e) => {
                    setHomeDivision(e.target.value);
                    setHomeDistrict('');
                  }}
                  className="w-full py-2 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E] cursor-pointer"
                >
                  <option value="">{t.allDivisions}</option>
                  {Object.keys(DIVISION_DISTRICTS).map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <select
                  value={homeDistrict}
                  disabled={!homeDivision}
                  onChange={(e) => setHomeDistrict(e.target.value)}
                  className="w-full py-2 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E] cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">{homeDivision ? t.allDistricts : t.selectDivisionFirst}</option>
                  {availableDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Thana Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={homeThana}
                  onChange={(e) => setHomeThana(e.target.value)}
                  placeholder={t.thanaPlaceholder}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E]"
                />

                {(homeDivision || homeDistrict || homeThana || homeSearch) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors cursor-pointer"
                    title={t.resetFilters}
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Results Status */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                {isHomeFilterLoading ? (
                  <span className="flex items-center gap-1.5 text-[#006A4E]">
                    <Loader2 size={12} className="animate-spin" /> {t.searchingText}
                  </span>
                ) : (
                  <>
                    <strong>{filteredHomeReports.length}</strong> {t.reportsFound}
                    {homeDivision && ` • ${homeDivision}`}
                    {homeDistrict && ` • ${homeDistrict}`}
                    {homeThana && ` • ${homeThana}`}
                  </>
                )}
              </div>
              {(homeDivision || homeDistrict || homeThana || homeSearch) && (
                <button
                  onClick={resetFilters}
                  className="text-[#006A4E] font-bold hover:underline cursor-pointer"
                >
                  {t.clearAllFilters}
                </button>
              )}
            </div>
          </div>

          {/* Reports Grid */}
          {isHomeFilterLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
              ))}
            </div>
          ) : filteredHomeReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-base font-bold text-gray-800">{t.noReportsFound}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">{t.tryChangingFilters}</p>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="bg-[#006A4E] hover:bg-[#004d38] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow cursor-pointer"
              >
                {t.addAreaReport}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeReportsToShow.map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>

              {/* View All -> Complaints page, shown whenever there are more
                  reports than the home page preview limit */}
              {hasMoreThanHomeLimit && (
                <div className="flex justify-center mt-8">
                  <Link
                    to="/blogs"
                    className="bg-[#006A4E] hover:bg-[#004d38] text-white px-6 py-3 rounded-full text-sm font-bold transition-all shadow flex items-center gap-2 no-underline cursor-pointer"
                  >
                    {lang === 'bn'
                      ? `সব ${filteredHomeReports.length} টি রিপোর্ট দেখুন`
                      : `View All ${filteredHomeReports.length} Reports`}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 mb-2">{t.deptSectionTitle}</h2>
        <p className="text-center text-gray-500 mb-10">{t.deptSectionDesc}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.key}
              to={`/blogs?category=${encodeURIComponent(c.key)}`}
              className="card-hover bg-white rounded-2xl p-5 text-center cursor-pointer shadow border border-gray-100 no-underline text-inherit block"
            >
              <div className="text-4xl mb-2">{c.emoji}</div>
              <div className="font-bold text-gray-800 text-sm">{c.label}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-mono">{c.sub}</div>
              <div className="mt-2 text-[#006A4E] font-extrabold text-base">
                {categoryCounts[c.key] || 0} {t.reportsSuffix}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mini Charts Overview */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              📊 {lang === 'bn' ? 'দ্রুত পরিসংখ্যান ওভারভিউ' : 'Quick Stats Overview'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'bn' ? 'বিভাগ ও ধরনভিত্তিক প্রাথমিক চিত্র' : 'Initial regional and category landscape'}
            </p>
          </div>
          <Link
            to="/analytics"
            className="bg-[#006A4E] hover:bg-[#004d38] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow no-underline"
          >
            {lang === 'bn' ? 'পূর্ণ অ্যানালিটিক্স দেখুন →' : 'View Full Analytics →'}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-3">
              {lang === 'bn' ? 'বিভাগ অনুযায়ী অভিযোগ সংখ্যা' : 'Reports by Division'}
            </h3>
            <div style={{ position: 'relative', height: '260px' }}>
              <Bar data={miniDivData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-3">
              {lang === 'bn' ? 'ফলাফল অনুপাত' : 'Outcome Breakdown'}
            </h3>
            <div style={{ position: 'relative', height: '260px' }}>
              <Doughnut data={miniOutcomeData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      </div>

      {/* Call To Action Banner */}
      <div className="bg-[#F42A41] text-white py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t.ctaTitle}</h2>
        <p className="text-red-100 max-w-xl mx-auto mb-6 text-sm sm:text-base">
          {t.ctaDesc}
        </p>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-white text-[#F42A41] hover:bg-gray-100 px-10 py-4 rounded-full text-base sm:text-lg font-extrabold transition-all shadow-xl cursor-pointer"
        >
          {t.ctaBtn}
        </button>
      </div>
    </div>
  );
};

export default Home;