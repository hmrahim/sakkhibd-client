import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../../context/ReportContext';
import {
  FileText, ThumbsUp, MessageSquare, Database, MapPin,
  ArrowUpRight, Target, Award, Zap, Flag
} from 'lucide-react';
import { StatCard, DonutChart, StatusBadge, CATEGORY_COLORS } from './DashboardCommon';

export default function DashboardOverview() {
  const { reports } = useReports();

  const totalReports  = reports.length;
  const totalLikes    = reports.reduce((s, r) => s + (r.likes || 0), 0);
  const totalComments = reports.reduce((s, r) => s + (r.comments?.length || 0), 0);
  const totalAmount   = reports.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

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

  const monthlyData = useMemo(() => {
    const map = {};
    reports.forEach(r => {
      const key = r.month || r.date?.slice(0, 7) || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    });
    const vals = Object.values(map);
    return vals.length ? vals.slice(-7) : [2, 5, 3, 8, 4, 10, 7];
  }, [reports]);

  const likesData = useMemo(() => {
    const sorted = [...reports].sort((a, b) => (a.likes || 0) - (b.likes || 0));
    return sorted.map(r => r.likes || 0).slice(-7);
  }, [reports]);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FileText}    label="Total Reports"    value={totalReports}
          trend={12} trendUp color="#22c55e" sparkData={monthlyData} sub="All time submissions" />
        <StatCard icon={ThumbsUp}    label="Total Reactions"  value={totalLikes}
          trend={8}  trendUp color="#3b82f6" sparkData={likesData} sub="Community support" />
        <StatCard icon={MessageSquare} label="Comments"       value={totalComments}
          trend={5}  trendUp color="#a855f7" sparkData={[1,3,2,5,4,7,6]} sub="Public discussion" />
        <StatCard icon={Database}    label="Bribe Amount"
          value={`৳${(totalAmount / 100000).toFixed(1)}L`}
          trend={3} trendUp={false} color="#F42A41" sparkData={[5,8,6,12,9,15,11]} sub="Reported total" />
      </div>

      {/* Second row: Donut + Top categories + Divisions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Donut */}
        <div className="rounded-2xl p-5 border border-white/10"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
          <h3 className="text-sm font-bold text-white mb-4">Category Distribution</h3>
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
              {reports.slice(0, 5).map(r => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-sm text-white/80 truncate max-w-[200px]">{r.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70">{r.category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{r.district}</td>
                  <td className="px-4 py-3 text-xs text-yellow-300 font-semibold">৳{r.amount}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status || 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Avg Bribe', value: `৳${totalReports ? Math.round(totalAmount / totalReports).toLocaleString() : 0}`, color: '#F42A41' },
          { icon: Award,  label: 'Top District', value: (() => { const m = {}; reports.forEach(r => { m[r.district] = (m[r.district]||0)+1; }); const e = Object.entries(m).sort((a,b)=>b[1]-a[1])[0]; return e ? e[0] : 'N/A'; })(), color: '#FFD700' },
          { icon: Zap,    label: 'Engagement Rate', value: `${totalReports ? Math.round((totalLikes / totalReports) * 10) / 10 : 0}x`, color: '#a855f7' },
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