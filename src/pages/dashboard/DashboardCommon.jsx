import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Sparkline = ({ data, color = '#22c55e', height = 36 }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const DonutChart = ({ segments, size = 80 }) => {
  const r = 30, cx = 40, cy = 40, circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">{total}</text>
    </svg>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    pending:  { label: 'Pending',  cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    verified: { label: 'Verified', cls: 'bg-green-500/20 text-green-300 border-green-500/30' },
    rejected: { label: 'Rejected', cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
    archived: { label: 'Archived', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  );
};

export const StatCard = ({ icon: Icon, label, value, sub, trend, trendUp, color, sparkData }) => (
  <div className="relative rounded-2xl p-5 overflow-hidden border border-white/10 flex flex-col gap-2"
    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}>
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl`} style={{ background: `${color}22` }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}%
        </div>
      )}
    </div>
    <div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-xs text-white/50 mt-0.5">{label}</div>
    </div>
    {sub && <div className="text-xs text-white/40">{sub}</div>}
    {sparkData && <div className="mt-1 opacity-60"><Sparkline data={sparkData} color={color} /></div>}
  </div>
);

export const MiniStatCard = ({ icon: Icon, label, value, color = '#22c55e', percent }) => (
  <div
    className="group relative rounded-2xl p-4 border border-white/10 overflow-hidden transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg"
    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}
  >
    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: color }} />
    <div className="flex items-center gap-3 pl-1.5">
      <div className="p-2.5 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: `${color}22` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xl font-extrabold text-white leading-tight tracking-tight">{value}</div>
        <div className="text-[11px] text-white/45 font-medium truncate">{label}</div>
      </div>
      {percent !== undefined && (
        <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: `${color}18`, color }}>
          {percent}%
        </span>
      )}
    </div>
  </div>
);

export const OverviewStrip = ({ items }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
    {items.map((item) => <MiniStatCard key={item.label} {...item} />)}
  </div>
);

export const Pill = ({ children, active, onClick, color = '#006A4E' }) => (
  <button onClick={onClick}
    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer"
    style={active
      ? { background: color, borderColor: color, color: '#fff' }
      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
    {children}
  </button>
);

export const CATEGORY_COLORS = [
  '#F42A41','#FF6B35','#FFD700','#22c55e','#3b82f6',
  '#8b5cf6','#ec4899','#06b6d4','#f97316','#84cc16'
];