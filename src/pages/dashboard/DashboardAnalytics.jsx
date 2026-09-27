import React, { useMemo } from 'react';
import { useReports } from '../../context/ReportContext';
import { TrendingUp, BarChart3, Layers, ThumbsUp } from 'lucide-react';
import { Sparkline, CATEGORY_COLORS, OverviewStrip } from './DashboardCommon';

export default function DashboardAnalytics() {
  const { reports } = useReports();
  const totalReports = reports.length;

  const categories = useMemo(() => {
    const map = {};
    reports.forEach(r => { map[r.category] = (map[r.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);

  const totalLikes = useMemo(() => reports.reduce((s, r) => s + (r.likes || 0), 0), [reports]);
  const avgEngagement = totalReports ? Math.round((totalLikes / totalReports) * 10) / 10 : 0;

  // Real analytics-specific stats for THIS page.
  const overviewItems = [
    { icon: BarChart3, label: 'Total Reports',    value: totalReports,       color: '#3b82f6' },
    { icon: Layers,    label: 'Categories Tracked', value: categories.length, color: '#a855f7' },
    { icon: ThumbsUp,  label: 'Total Reactions',  value: totalLikes,         color: '#22c55e' },
    { icon: TrendingUp, label: 'Avg Reactions/Report', value: avgEngagement, color: '#f59e0b' },
  ];

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
    <div className="space-y-6">
      <OverviewStrip items={overviewItems} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Reports over time */}
        <div className="rounded-2xl p-5 border border-white/10"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
          <h3 className="text-sm font-bold text-white mb-1">Reports Over Time</h3>
          <p className="text-xs text-white/40 mb-4">Monthly submission trend</p>
          <Sparkline data={monthlyData} color="#22c55e" height={80} />
          <div className="flex justify-between text-xs text-white/30 mt-2">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul'].slice(-monthlyData.length).map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
        {/* Reaction trend */}
        <div className="rounded-2xl p-5 border border-white/10"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
          <h3 className="text-sm font-bold text-white mb-1">Engagement Trend</h3>
          <p className="text-xs text-white/40 mb-4">Reactions & community activity</p>
          <Sparkline data={likesData} color="#3b82f6" height={80} />
          <div className="flex justify-between text-xs text-white/30 mt-2">
            {['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7'].slice(-likesData.length).map(w => <span key={w}>{w}</span>)}
          </div>
        </div>
      </div>

      {/* Category table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">Category Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th className="px-5 py-3 text-left text-xs text-white/40 font-semibold uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs text-white/40 font-semibold uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs text-white/40 font-semibold uppercase">Reports</th>
                <th className="px-4 py-3 text-left text-xs text-white/40 font-semibold uppercase">Share</th>
                <th className="px-4 py-3 text-left text-xs text-white/40 font-semibold uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(([cat, cnt], i) => (
                <tr key={cat} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-xs text-white/30">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[i % 10] }} />
                      <span className="text-sm text-white/80">{cat}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{cnt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${(cnt / (totalReports || 1)) * 100}%`, background: CATEGORY_COLORS[i % 10] }} />
                      </div>
                      <span className="text-xs text-white/50">{Math.round((cnt / (totalReports || 1)) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-green-400 flex items-center gap-1"><TrendingUp size={11} /> Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}