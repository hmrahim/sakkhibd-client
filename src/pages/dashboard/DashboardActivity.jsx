import React from 'react';
import { useReports } from '../../context/ReportContext';
import { MessageSquare, FileText } from 'lucide-react';

export default function DashboardActivity() {
  const { reports } = useReports();

  const feed = reports.flatMap(r => [
    ...(r.comments || []).map(c => ({
      type: 'comment',
      report: r.title,
      text: c.text,
      author: c.author,
      date: c.date,
      icon: MessageSquare,
      color: '#a855f7'
    })),
    {
      type: 'report',
      report: r.title,
      text: `New report: ${r.outcome || r.category}`,
      author: r.author || 'Anonymous',
      date: r.date,
      icon: FileText,
      color: '#22c55e'
    }
  ]).slice(0, 40);

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
      <div className="px-5 py-4 border-b border-white/10">
        <h3 className="text-sm font-bold text-white">Live Activity Feed</h3>
        <p className="text-xs text-white/40 mt-0.5">All recent actions across the platform</p>
      </div>
      <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
        {feed.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex gap-3 px-5 py-4 hover:bg-white/5 transition-colors">
              <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl" style={{ background: `${item.color}22` }}>
                <Icon size={14} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 font-medium truncate">{item.report}</div>
                <div className="text-xs text-white/50 truncate mt-0.5">{item.text}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/30">{item.author}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/30">{item.date}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="px-2 py-0.5 rounded-full text-xs capitalize" style={{ background: `${item.color}22`, color: item.color }}>
                  {item.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}