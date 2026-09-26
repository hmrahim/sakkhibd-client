import React from 'react';
import { useReports } from '../../context/ReportContext';
import { Download, RefreshCw } from 'lucide-react';

export default function DashboardSettings() {
  const { lang, exportToCSV, triggerToast } = useReports();

  return (
    <div className="space-y-5 max-w-2xl">
      {[
        { section: 'Platform', items: [
          { label: 'Platform Name', desc: 'The public name of this platform', value: 'ঘুষ — Ghush' },
          { label: 'Language Default', desc: 'Default language for new users', value: lang === 'bn' ? 'Bengali (বাংলা)' : 'English' },
        ]},
        { section: 'Moderation', items: [
          { label: 'Auto-verify Reports', desc: 'Automatically verify reports with 10+ reactions', value: 'Disabled' },
          { label: 'Spam Filter', desc: 'Block duplicate reports from same IP', value: 'Enabled' },
        ]},
        { section: 'Export', items: [
          { label: 'CSV Delimiter', desc: 'Field separator for exported CSV files', value: 'Comma (,)' },
          { label: 'Include Comments', desc: 'Include comment thread in CSV export', value: 'Yes' },
        ]},
      ].map(({ section, items }) => (
        <div key={section} className="rounded-2xl border border-white/10 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">{section}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {items.map(item => (
              <div key={item.label} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-sm font-medium text-white/80">{item.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{item.desc}</div>
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/60 border border-white/10">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <button onClick={() => exportToCSV()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
          style={{ background: '#006A4E' }}>
          <Download size={15} /> Export All Data
        </button>
        <button onClick={() => triggerToast('Settings saved!')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all cursor-pointer">
          <RefreshCw size={15} /> Save Changes
        </button>
      </div>
    </div>
  );
}