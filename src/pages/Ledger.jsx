import React from 'react';
import { useReports } from '../context/ReportContext';
import {
  DIVISION_DISTRICTS,
  CATEGORY_NAMES_TRANSLATION,
  DIVISION_NAMES_TRANSLATION,
} from '../data/initialData';
import { ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

const Ledger = () => {
  const {
    t,
    lang,
    analyticsData,
    isAnalyticsLoading,
    isAnalyticsError,
    analyticsFetchError,
    analyticsUpdatedAt,
    refetchAnalytics,
  } = useReports();

  // ---------- Loading state ----------
  if (isAnalyticsLoading && !analyticsData) {
    return (
      <div>
        <div className="bg-[#006A4E] py-12 px-4 text-white text-center">
          <h1 className="text-3xl font-extrabold mb-2">{t.ledgerTitle}</h1>
          <p className="text-green-200 text-sm">{t.ledgerSubtitle}</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
          <RefreshCw size={28} className="animate-spin text-[#006A4E]" />
          <p className="text-sm font-medium">{t.ledgerLoadingText}</p>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (isAnalyticsError && !analyticsData) {
    return (
      <div>
        <div className="bg-[#006A4E] py-12 px-4 text-white text-center">
          <h1 className="text-3xl font-extrabold mb-2">{t.ledgerTitle}</h1>
          <p className="text-green-200 text-sm">{t.ledgerSubtitle}</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle size={32} className="text-[#F42A41]" />
          <p className="text-sm text-gray-600 max-w-md">{t.ledgerErrorText}</p>
          {analyticsFetchError?.message && (
            <p className="text-xs text-gray-400 font-mono">{analyticsFetchError.message}</p>
          )}
          <button
            onClick={() => refetchAnalytics()}
            className="inline-flex items-center gap-2 bg-[#006A4E] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#00543d] transition-colors"
          >
            <RefreshCw size={14} /> {t.ledgerRetryBtn}
          </button>
        </div>
      </div>
    );
  }

  const data = analyticsData || {};

  const totalReports = data.totalReports || 0;
  const totalAmount = data.totalAmount || 0;
  const avgAmount = data.avgAmount || 0;
  const maxAmount = data.maxAmount || 0;

  // ---------- Amount Bands (server-aggregated over the full collection) ----------
  const bandLabelMap = {
    upTo1000: lang === 'bn' ? '৳১,০০০ বা কম' : '৳1,000 or less',
    '1001To5000': lang === 'bn' ? '৳১,০০১–৳৫,০০০' : '৳1,001–৳5,000',
    '5001To10000': lang === 'bn' ? '৳৫,০০১–৳১০,০০০' : '৳5,001–৳10,000',
    above10000: lang === 'bn' ? '৳১০,০০০-এর বেশি' : 'Above ৳10,000',
  };
  const amtBands = (data.amountBands || []).map((b) => ({
    label: bandLabelMap[b.key] || b.key,
    count: b.count || 0,
  }));

  // ---------- Outcome Bands (server-computed counts) ----------
  const pCount = data.paidCount || 0;
  const rCount = data.refusedCount || 0;
  const mCount = data.pendingCount || 0;
  const outcomes = [
    { label: lang === 'bn' ? 'পরিশোধিত (Paid)' : 'Paid', count: pCount, color: 'bg-[#F42A41]' },
    { label: lang === 'bn' ? 'প্রত্যাখ্যাত (Refused)' : 'Refused', count: rCount, color: 'bg-[#006A4E]' },
    { label: lang === 'bn' ? 'দাবি মুলতুবি (Pending)' : 'Pending', count: mCount, color: 'bg-amber-500' },
  ];
  const refusalPct = data.refusalPct ?? 0;

  // ---------- Department Registry: real categories that actually have reports,
  // sorted by volume (server already sorts by count desc) ----------
  const categoryDistribution = data.categoryDistribution || [];
  const deptRows = categoryDistribution.map((c) => ({
    key: c._id || (lang === 'bn' ? 'অজানা' : 'Unknown'),
    label: CATEGORY_NAMES_TRANSLATION[c._id]?.[lang] || c._id || t.otherCategoryLabel,
    count: c.count || 0,
    sum: c.totalAmount || 0,
  }));

  // ---------- Division Registry: merge server counts with the full, fixed
  // list of divisions so every division shows even with zero reports ----------
  const divCountMap = {};
  const divSumMap = {};
  (data.divisionDistribution || []).forEach((d) => {
    divCountMap[d._id] = d.count || 0;
    divSumMap[d._id] = d.totalAmount || 0;
  });

  const divRows = Object.keys(DIVISION_DISTRICTS).map((d) => ({
    key: d,
    label: DIVISION_NAMES_TRANSLATION[d]?.short?.[lang] || d.replace(' বিভাগ', ''),
    count: divCountMap[d] || 0,
    sum: divSumMap[d] || 0,
  }));

  const sortedDivsForTop = [...divRows].sort((a, b) => b.count - a.count);
  const topDiv = sortedDivsForTop[0]?.count ? sortedDivsForTop[0].label : '—';

  const lastUpdatedText = analyticsUpdatedAt
    ? new Date(analyticsUpdatedAt).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div>
      <div className="bg-[#006A4E] py-12 px-4 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2">{t.ledgerTitle}</h1>
        <p className="text-green-200 text-sm">{t.ledgerSubtitle}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Live status bar */}
        <div className="flex items-center justify-end gap-3 mb-4 text-xs text-gray-400">
          {lastUpdatedText && (
            <span>{t.ledgerLiveUpdatedText}: {lastUpdatedText}</span>
          )}
          <button
            onClick={() => refetchAnalytics()}
            disabled={isAnalyticsLoading}
            className="inline-flex items-center gap-1.5 text-[#006A4E] font-semibold hover:underline disabled:opacity-50"
          >
            <RefreshCw size={12} className={isAnalyticsLoading ? 'animate-spin' : ''} />
            {t.ledgerRefreshBtn}
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl shadow border border-gray-100 text-center">
            <span className="text-xs text-gray-500 font-medium">{t.publicReports}</span>
            <div className="text-2xl font-extrabold text-[#006A4E] mono-num mt-1">{totalReports}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow border border-gray-100 text-center">
            <span className="text-xs text-gray-500 font-medium">{t.totalClaimAmount}</span>
            <div className="text-2xl font-extrabold text-[#F42A41] mono-num mt-1">৳{totalAmount.toLocaleString('en-US')}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow border border-gray-100 text-center">
            <span className="text-xs text-gray-500 font-medium">{t.highestClaim}</span>
            <div className="text-2xl font-extrabold text-[#F42A41] mono-num mt-1">৳{maxAmount.toLocaleString('en-US')}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow border border-gray-100 text-center">
            <span className="text-xs text-gray-500 font-medium">{t.averageClaim}</span>
            <div className="text-2xl font-extrabold text-amber-600 mono-num mt-1">৳{avgAmount.toLocaleString('en-US')}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow border border-gray-100 text-center col-span-2 md:col-span-1">
            <span className="text-xs text-gray-500 font-medium">{t.topDivision}</span>
            <div className="text-xl font-extrabold text-[#004d38] mt-1">{topDiv}</div>
          </div>
        </div>

        {/* 2 Distribution Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Amount Bands */}
          <div className="bg-white p-6 rounded-3xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-[#006A4E] uppercase tracking-wider">{t.amountDistSub}</span>
                <h3 className="text-lg font-extrabold text-gray-800 mt-0.5">{t.amountDistTitle}</h3>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-mono">{t.allReportsTag}</span>
            </div>
            <div className="space-y-4 text-xs font-mono">
              {amtBands.map((b) => {
                const pct = totalReports ? Math.round((b.count / totalReports) * 100) : 0;
                return (
                  <div key={b.label} className="flex items-center justify-between gap-3">
                    <span className="w-36 text-gray-700 font-sans">{b.label}</span>
                    <div className="flex-1 progress-track">
                      <div className="progress-fill bg-[#006A4E]" style={{ width: `${pct}%` }}></div>
                    </div>
                    <b className="w-8 text-right text-gray-800">{b.count}</b>
                    <span className="text-gray-400 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outcome Bands */}
          <div className="bg-white p-6 rounded-3xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-[#F42A41] uppercase tracking-wider">{t.outcomeDistSub}</span>
                <h3 className="text-lg font-extrabold text-gray-800 mt-0.5">{t.outcomeDistTitle}</h3>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-mono">{t.liveStatusTag}</span>
            </div>
            <div className="space-y-4 text-xs font-mono">
              {outcomes.map((o) => {
                const pct = totalReports ? Math.round((o.count / totalReports) * 100) : 0;
                return (
                  <div key={o.label} className="flex items-center justify-between gap-3">
                    <span className="w-36 text-gray-700 font-sans">{o.label}</span>
                    <div className="flex-1 progress-track">
                      <div className={`progress-fill ${o.color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <b className="w-8 text-right text-gray-800">{o.count}</b>
                    <span className="text-gray-400 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 bg-[#e8f5f0] border border-green-200 rounded-2xl text-xs text-[#004d38] font-medium flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#006A4E]" />
              <span><strong>{refusalPct}%</strong> {t.refusalNoticeText}</span>
            </div>
          </div>
        </div>

        {/* Registry Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl shadow border border-gray-100">
            <h3 className="font-extrabold text-base text-gray-800 mb-1">{t.deptRegistryTitle}</h3>
            <p className="text-xs text-gray-400 mb-4">{t.deptRegistrySub}</p>
            <div className="space-y-2 text-xs">
              {deptRows.length === 0 && (
                <p className="text-gray-400 py-4 text-center">{t.allReportsTag} — 0</p>
              )}
              {deptRows.map((d, i) => {
                const pct = totalReports ? Math.round((d.count / totalReports) * 100) : 0;
                return (
                  <div key={d.key} className="flex items-center justify-between py-2 border-b border-gray-100 font-mono">
                    <span className="text-gray-400 w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-sans font-medium text-gray-800 flex-1 ml-2">{d.label}</span>
                    <div className="w-20 mx-3 progress-track">
                      <div className="progress-fill bg-[#006A4E]" style={{ width: `${pct}%` }}></div>
                    </div>
                    <b className="w-12 text-right">{d.count} {t.itemsUnit}</b>
                    <span className="text-[#F42A41] font-bold w-24 text-right">৳{d.sum.toLocaleString('en-US')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow border border-gray-100">
            <h3 className="font-extrabold text-base text-gray-800 mb-1">{t.divRegistryTitle}</h3>
            <p className="text-xs text-gray-400 mb-4">{t.divRegistrySub}</p>
            <div className="space-y-2 text-xs">
              {divRows.map((d, i) => {
                const pct = totalReports ? Math.round((d.count / totalReports) * 100) : 0;
                return (
                  <div key={d.key} className="flex items-center justify-between py-2 border-b border-gray-100 font-mono">
                    <span className="text-gray-400 w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-sans font-medium text-gray-800 flex-1 ml-2">{d.label}</span>
                    <div className="w-20 mx-3 progress-track">
                      <div className="progress-fill bg-[#004d38]" style={{ width: `${pct}%` }}></div>
                    </div>
                    <b className="w-12 text-right">{d.count} {t.itemsUnit}</b>
                    <span className="text-[#F42A41] font-bold w-24 text-right">৳{d.sum.toLocaleString('en-US')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
