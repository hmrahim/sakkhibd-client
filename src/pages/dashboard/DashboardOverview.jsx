import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../../context/ReportContext';
import {
  FileText, ThumbsUp, MessageSquare, Database, MapPin,
  ArrowUpRight, Target, Award, Zap, Flag, RefreshCw, Loader2,
  Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { StatCard, DonutChart, StatusBadge, CATEGORY_COLORS, OverviewStrip } from './DashboardCommon';

// Try every timestamp field a report might carry (backend Mongo docs use
// createdAt; locally cached / seed records may only have a display "date").
// Returns NaN when nothing parseable is found, so callers can gracefully
// skip that record instead of pretending it happened "now".
const getReportTimestamp = (r) => {
  const candidates = [r.createdAt, r.updatedAt, r.timestamp, r.date];
  for (const c of candidates) {
    if (!c) continue;
    const ts = new Date(c).getTime();
    if (!Number.isNaN(ts)) return ts;
  }
  return NaN;
};

// Split a chronologically-ordered array into N equal buckets and sum a
// derived value per bucket — used to build real (not fabricated) sparklines.
const bucketize = (arr, mapFn, buckets = 7) => {
  if (!arr.length) return Array(buckets).fill(0);
  const size = Math.max(1, Math.ceil(arr.length / buckets));
  const out = [];
  for (let i = 0; i < buckets; i++) {
    out.push(arr.slice(i * size, (i + 1) * size).reduce((s, x) => s + mapFn(x), 0));
  }
  return out;
};

// Real week-over-week-style trend derived from a bucketed series: compares
// the earlier half of the window against the later half.
const trendFromSeries = (series) => {
  const total = series.reduce((a, b) => a + b, 0);
  if (total === 0) return null; // nothing to compare — hide the badge instead of faking one
  const mid = Math.floor(series.length / 2);
  const early = series.slice(0, mid).reduce((a, b) => a + b, 0);
  const late = series.slice(mid).reduce((a, b) => a + b, 0);
  if (early === 0) return { pct: 100, up: true };
  const pct = Math.round(((late - early) / early) * 100);
  return { pct: Math.abs(pct), up: late >= early };
};

// Small ticking "X seconds/minutes ago" label so the live badge visibly moves.
const LiveUpdatedLabel = ({ updatedAt, lang }) => {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  if (!updatedAt) return null;
  const secs = Math.max(0, Math.round((Date.now() - updatedAt) / 1000));
  const text = secs < 5
    ? (lang === 'bn' ? 'এইমাত্র' : 'just now')
    : secs < 60
      ? (lang === 'bn' ? `${secs} সেকেন্ড আগে` : `${secs}s ago`)
      : (lang === 'bn' ? `${Math.floor(secs / 60)} মিনিট আগে` : `${Math.floor(secs / 60)}m ago`);
  return <span>{text}</span>;
};

export default function DashboardOverview() {
  const {
    reports,
    lang,
    isReportsLoading,
    isReportsFetching,
    reportsUpdatedAt,
    refetchReports,
  } = useReports();

  const totalReports  = reports.length;
  const totalLikes    = reports.reduce((s, r) => s + (r.likes || 0), 0);
  const totalComments = reports.reduce((s, r) => s + (r.commentsCount ?? r.comments?.length ?? 0), 0);
  const totalAmount   = reports.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  // Put reports in real chronological order (oldest → newest) wherever we
  // have usable timestamps, so sparklines/trends read left-to-right sensibly.
  const chronological = useMemo(() => {
    const withTs = reports.map((r) => ({ r, ts: getReportTimestamp(r) }));
    const anyValid = withTs.some((x) => !Number.isNaN(x.ts));
    if (anyValid) {
      return [...withTs].sort((a, b) => (Number.isNaN(a.ts) ? 0 : a.ts) - (Number.isNaN(b.ts) ? 0 : b.ts)).map((x) => x.r);
    }
    // No usable dates at all — assume the API returned newest-first and flip it.
    return [...reports].reverse();
  }, [reports]);

  const reportsSeries  = useMemo(() => bucketize(chronological, () => 1), [chronological]);
  const likesSeries    = useMemo(() => bucketize(chronological, (r) => r.likes || 0), [chronological]);
  const commentsSeries = useMemo(() => bucketize(chronological, (r) => r.commentsCount ?? r.comments?.length ?? 0), [chronological]);
  const amountSeries   = useMemo(() => bucketize(chronological, (r) => parseFloat(r.amount) || 0), [chronological]);

  const reportsTrend  = useMemo(() => trendFromSeries(reportsSeries), [reportsSeries]);
  const likesTrend    = useMemo(() => trendFromSeries(likesSeries), [likesSeries]);
  const commentsTrend = useMemo(() => trendFromSeries(commentsSeries), [commentsSeries]);
  const amountTrend   = useMemo(() => trendFromSeries(amountSeries), [amountSeries]);

  const categories = useMemo(() => {
    const map = {};
    reports.forEach(r => { map[r.category] = (map[r.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);

  const divisions = useMemo(() => {
    const map = {};
    reports.forEach(r => { map[r.division] = (map[r.division] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [reports]);

  const recentReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const tb = getReportTimestamp(b), ta = getReportTimestamp(a);
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    }).slice(0, 5);
  }, [reports]);

  const avgBribe = totalReports ? Math.round(totalAmount / totalReports) : 0;

  const topDistrict = useMemo(() => {
    const m = {};
    reports.forEach(r => { if (r.district) m[r.district] = (m[r.district] || 0) + 1; });
    const entries = Object.entries(m).sort((a, b) => b[1] - a[1]);
    return entries.length ? entries[0][0] : (lang === 'bn' ? 'নেই' : 'N/A');
  }, [reports, lang]);

  const engagementRate = totalReports ? Math.round((totalLikes / totalReports) * 10) / 10 : 0;

  // Real status breakdown for THIS page's overview strip (Overview page only).
  const statusCounts = useMemo(() => {
    const counts = { pending: 0, verified: 0, rejected: 0, archived: 0 };
    reports.forEach(r => {
      const s = r.status || 'pending';
      if (counts[s] !== undefined) counts[s]++;
      else counts.pending++;
    });
    return counts;
  }, [reports]);

  const statusPct = (n) => (totalReports ? Math.round((n / totalReports) * 100) : 0);

  const overviewItems = [
    { icon: FileText,     label: lang === 'bn' ? 'মোট রিপোর্ট' : 'Total Reports', value: totalReports, color: '#3b82f6' },
    { icon: Clock,        label: lang === 'bn' ? 'পেন্ডিং' : 'Pending',   value: statusCounts.pending,  color: '#f59e0b', percent: statusPct(statusCounts.pending) },
    { icon: CheckCircle2, label: lang === 'bn' ? 'অনুমোদিত' : 'Approved', value: statusCounts.verified, color: '#22c55e', percent: statusPct(statusCounts.verified) },
    { icon: XCircle,      label: lang === 'bn' ? 'বাতিল' : 'Rejected',    value: statusCounts.rejected, color: '#ef4444', percent: statusPct(statusCounts.rejected) },
  ];

  // First load with nothing cached yet — show a loading state instead of a
  // dashboard full of misleading zeros.
  if (isReportsLoading && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white/50 gap-3">
        <Loader2 size={28} className="animate-spin text-green-400" />
        <p className="text-sm">{lang === 'bn' ? 'লাইভ ডেটা লোড হচ্ছে...' : 'Loading live data...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Live status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 -mb-2">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
          </span>
          <span className="font-semibold text-green-400">{lang === 'bn' ? 'লাইভ' : 'Live'}</span>
          <span className="text-white/30">•</span>
          <span>
            {lang === 'bn' ? 'সর্বশেষ সিঙ্ক: ' : 'Last synced: '}
            <LiveUpdatedLabel updatedAt={reportsUpdatedAt} lang={lang} />
          </span>
        </div>
        <button
          onClick={() => refetchReports()}
          disabled={isReportsFetching}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw size={12} className={isReportsFetching ? 'animate-spin' : ''} />
          {isReportsFetching
            ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...')
            : (lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh now')}
        </button>
      </div>

      {/* Status overview strip — real counts for THIS page */}
      <OverviewStrip items={overviewItems} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FileText}    label="Total Reports"    value={totalReports}
          trend={reportsTrend?.pct} trendUp={reportsTrend?.up} color="#22c55e" sparkData={reportsSeries} sub="All time submissions" />
        <StatCard icon={ThumbsUp}    label="Total Reactions"  value={totalLikes}
          trend={likesTrend?.pct}  trendUp={likesTrend?.up} color="#3b82f6" sparkData={likesSeries} sub="Community support" />
        <StatCard icon={MessageSquare} label="Comments"       value={totalComments}
          trend={commentsTrend?.pct}  trendUp={commentsTrend?.up} color="#a855f7" sparkData={commentsSeries} sub="Public discussion" />
        <StatCard icon={Database}    label="Bribe Amount"
          value={`৳${(totalAmount / 100000).toFixed(1)}L`}
          trend={amountTrend?.pct} trendUp={amountTrend?.up} color="#F42A41" sparkData={amountSeries} sub="Reported total" />
      </div>

      {/* Second row: Donut + Top categories + Divisions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Donut */}
        <div className="rounded-2xl p-5 border border-white/10"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
          <h3 className="text-sm font-bold text-white mb-4">Category Distribution</h3>
          {categories.length === 0 ? (
            <p className="text-xs text-white/40">{lang === 'bn' ? 'কোনো ডেটা নেই' : 'No data yet'}</p>
          ) : (
            <div className="flex items-center gap-4">
              <DonutChart size={100}
                segments={categories.slice(0, 5).map((c, i) => ({ value: c[1], color: CATEGORY_COLORS[i] }))} />
              <div className="flex-1 space-y-2">
                {categories.slice(0, 5).map(([cat, cnt], i) => (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i] }} />
                      <span className="text-xs text-white/70 truncate max-w-[90px]">{cat}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Categories Bar */}
        <div className="rounded-2xl p-5 border border-white/10"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
          <h3 className="text-sm font-bold text-white mb-4">Top Categories</h3>
          <div className="space-y-3">
            {categories.slice(0, 5).map(([cat, cnt], i) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70 truncate max-w-[130px]">{cat}</span>
                  <span className="text-white font-semibold">{cnt}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(cnt / (categories[0]?.[1] || 1)) * 100}%`, background: CATEGORY_COLORS[i] }} />
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-xs text-white/40">{lang === 'bn' ? 'কোনো ডেটা নেই' : 'No data yet'}</p>}
          </div>
        </div>

        {/* Division Map */}
        <div className="rounded-2xl p-5 border border-white/10"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <MapPin size={14} className="text-green-400" /> Division Breakdown
          </h3>
          <div className="space-y-3">
            {divisions.map(([div, cnt]) => (
              <div key={div} className="flex items-center justify-between">
                <span className="text-xs text-white/70 truncate max-w-[130px]">{div}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${(cnt / (divisions[0]?.[1] || 1)) * 100}%`, background: '#006A4E' }} />
                  </div>
                  <span className="text-xs font-bold text-white w-4 text-right">{cnt}</span>
                </div>
              </div>
            ))}
            {divisions.length === 0 && <p className="text-xs text-white/40">{lang === 'bn' ? 'কোনো ডেটা নেই' : 'No data yet'}</p>}
          </div>
        </div>
      </div>

      {/* Recent Reports mini-table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Reports</h3>
          <Link to="/dashboard/reports"
            className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
            View All <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-xs text-white/40 font-semibold uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs text-white/40 font-semibold uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs text-white/40 font-semibold uppercase">District</th>
                <th className="px-4 py-3 text-left text-xs text-white/40 font-semibold uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs text-white/40 font-semibold uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map(r => (
                <tr key={r.id || r._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-sm text-white/80 truncate max-w-[200px]">{r.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70">{r.category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{r.district}</td>
                  <td className="px-4 py-3 text-xs text-yellow-300 font-semibold">৳{r.amount}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status || 'pending'} /></td>
                </tr>
              ))}
              {recentReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-white/40">
                    {lang === 'bn' ? 'এখনো কোনো রিপোর্ট নেই' : 'No reports yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Avg Bribe', value: `৳${avgBribe.toLocaleString()}`, color: '#F42A41' },
          { icon: Award,  label: 'Top District', value: topDistrict, color: '#FFD700' },
          { icon: Zap,    label: 'Engagement Rate', value: `${engagementRate}x`, color: '#a855f7' },
          { icon: Flag,   label: 'Divisions', value: divisions.length, color: '#3b82f6' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 border border-white/10 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
            <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${color}22` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white truncate max-w-[100px]">{value}</div>
              <div className="text-xs text-white/40">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
