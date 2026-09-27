import React, { useMemo } from 'react';
import { useReports } from '../../context/ReportContext';
import { Tag, Layers, TrendingUp, BarChart2 } from 'lucide-react';
import { CATEGORY_COLORS, OverviewStrip } from './DashboardCommon';

export default function DashboardCategories() {
  const { reports } = useReports();
  const totalReports = reports.length;

  const categories = useMemo(() => {
    const map = {};
    reports.forEach(r => { map[r.category] = (map[r.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);

  // Real category-specific stats for THIS page.
  const overviewItems = [
    { icon: Layers,    label: 'Active Categories', value: categories.length, color: '#3b82f6' },
    { icon: Tag,       label: 'Top Category', value: categories[0]?.[0] || 'N/A', color: '#22c55e' },
    { icon: BarChart2, label: 'Top Category Count', value: categories[0]?.[1] || 0, color: '#F42A41' },
    { icon: TrendingUp, label: 'Avg / Category', value: categories.length ? Math.round(totalReports / categories.length) : 0, color: '#a855f7' },
  ];

  return (
    <div className="space-y-5">
      <OverviewStrip items={overviewItems} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(([cat, cnt], i) => (
          <div key={cat} className="rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl" style={{ background: `${CATEGORY_COLORS[i % 10]}22` }}>
                <Tag size={18} style={{ color: CATEGORY_COLORS[i % 10] }} />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: CATEGORY_COLORS[i % 10] + '33', border: `1px solid ${CATEGORY_COLORS[i % 10]}55` }}>
                {cnt} reports
              </span>
            </div>
            <div className="text-sm font-bold text-white mb-1 truncate">{cat}</div>
            <div className="text-xs text-white/40 mb-3">{Math.round((cnt / (totalReports || 1)) * 100)}% of all reports</div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all group-hover:opacity-100"
                style={{ width: `${(cnt / (categories[0]?.[1] || 1)) * 100}%`, background: CATEGORY_COLORS[i % 10] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}