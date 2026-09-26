import React, { useState, useMemo } from 'react';
import { useReports } from '../../context/ReportContext';
import {
  Search, Download, Trash2, Eye, Edit3, CheckCircle,
  XCircle, Clock, ChevronDown, ChevronUp, ChevronRight, Check
} from 'lucide-react';
import { StatusBadge } from './DashboardCommon';

export default function DashboardReports() {
  const {
    reports,
    exportToCSV,
    triggerToast,
    setSelectedReport,
    deleteReport,
    deleteMultipleReports,
    updateReport
  } = useReports();

  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy]               = useState('date');
  const [sortDir, setSortDir]             = useState('desc');
  const [selectedRows, setSelectedRows]   = useState([]);
  const [expandedRow, setExpandedRow]     = useState(null);
  const [page, setPage]                   = useState(1);
  const [reportStatuses, setReportStatuses] = useState({});
  const [showBulkMenu, setShowBulkMenu]   = useState(false);

  const PER_PAGE = 10;

  const categories = useMemo(() => {
    const map = {};
    reports.forEach(r => { map[r.category] = (map[r.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);

  const filtered = useMemo(() => {
    let list = [...reports];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q) ||
        r.official?.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'all') list = list.filter(r => r.category === filterCategory);
    const statusFilter = filterStatus !== 'all' ? filterStatus : null;
    if (statusFilter) {
      list = list.filter(r => (reportStatuses[r.id] || r.status || 'pending') === statusFilter);
    }
    list.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (sortBy === 'likes') { va = a.likes || 0; vb = b.likes || 0; }
      if (sortBy === 'amount') { va = parseFloat(a.amount) || 0; vb = parseFloat(b.amount) || 0; }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [reports, search, filterCategory, filterStatus, sortBy, sortDir, reportStatuses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setStatus = (id, status) => {
    setReportStatuses(prev => ({ ...prev, [id]: status }));
    if (updateReport) {
      updateReport(id, { status });
    }
    triggerToast(`Report marked as ${status}`);
  };

  const toggleRow = id => setSelectedRows(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const toggleAll = () => setSelectedRows(prev =>
    prev.length === paginated.length ? [] : paginated.map(r => r.id)
  );

  const bulkSetStatus = (status) => {
    const updated = {};
    selectedRows.forEach(id => {
      updated[id] = status;
      if (updateReport) updateReport(id, { status });
    });
    setReportStatuses(prev => ({ ...prev, ...updated }));
    triggerToast(`${selectedRows.length} reports marked as ${status}`);
    setSelectedRows([]);
    setShowBulkMenu(false);
  };

  const SortTh = ({ col, children }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none hover:text-white/80 transition-colors whitespace-nowrap"
      onClick={() => { setSortBy(col); setSortDir(d => col === sortBy ? (d === 'asc' ? 'desc' : 'asc') : 'desc'); setPage(1); }}>
      <span className="flex items-center gap-1">
        {children}
        {sortBy === col ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
      </span>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reports, district, official…"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:bg-white/8 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white/70 focus:outline-none focus:border-green-500/50 cursor-pointer min-w-[120px]">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white/70 focus:outline-none focus:border-green-500/50 cursor-pointer min-w-[130px] max-w-full sm:max-w-[160px]">
            <option value="all">All Categories</option>
            {categories.map(([cat]) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button onClick={exportToCSV}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-white/70 hover:text-white hover:border-white/20 transition-all cursor-pointer">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-green-500/30 bg-green-500/10">
          <span className="text-xs sm:text-sm font-semibold text-green-300">
            {selectedRows.length} report{selectedRows.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button onClick={() => setShowBulkMenu(o => !o)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500 text-white cursor-pointer hover:bg-green-600 transition">
                Change Status <ChevronDown size={12} />
              </button>
              {showBulkMenu && (
                <div className="absolute right-0 top-9 w-36 rounded-xl border border-white/10 shadow-2xl z-30 py-1 overflow-hidden"
                  style={{ background: '#0d2018' }}>
                  {['pending', 'verified', 'rejected', 'archived'].map(s => (
                    <button key={s} onClick={() => bulkSetStatus(s)}
                      className="w-full text-left px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 capitalize flex items-center gap-2">
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { deleteMultipleReports(selectedRows); setSelectedRows([]); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 cursor-pointer transition">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th className="px-4 py-3 text-left w-8">
                  <input type="checkbox"
                    checked={selectedRows.length === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="rounded border-white/20 bg-white/5 accent-green-500 cursor-pointer" />
                </th>
                <SortTh col="title">Title / Details</SortTh>
                <SortTh col="category">Category</SortTh>
                <SortTh col="district">Location</SortTh>
                <SortTh col="amount">Amount</SortTh>
                <SortTh col="likes">Reactions</SortTh>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-white/30 text-sm">
                    No reports match the current filters
                  </td>
                </tr>
              ) : paginated.map(r => {
                const isSelected = selectedRows.includes(r.id);
                const isExpanded = expandedRow === r.id;
                const status = reportStatuses[r.id] || r.status || 'pending';
                return (
                  <React.Fragment key={r.id}>
                    <tr className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-green-500/5' : ''}`}>
                      <td className="px-4 py-3.5">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRow(r.id)}
                          className="rounded border-white/20 bg-white/5 accent-green-500 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3.5 max-w-[240px]">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                            className="text-white/30 hover:text-white/60 transition cursor-pointer">
                            <ChevronRight size={14} className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-white/90 truncate">{r.title}</div>
                            {r.official && <div className="text-[11px] sm:text-xs text-white/40 truncate">{r.official} · {r.officialPost}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white/60 whitespace-nowrap">
                        {r.district}{r.division ? `, ${r.division.replace(' বিভাগ','')}` : ''}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs sm:text-sm font-bold text-yellow-300">৳{(+r.amount).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white/60 whitespace-nowrap">
                        👍 {r.likes || 0}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedReport(r)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition cursor-pointer" title="View Detail">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setStatus(r.id, 'verified')}
                            className="p-1.5 rounded-lg text-green-400/60 hover:text-green-300 hover:bg-green-500/10 transition cursor-pointer" title="Verify">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => setStatus(r.id, 'rejected')}
                            className="p-1.5 rounded-lg text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer" title="Reject">
                            <XCircle size={14} />
                          </button>
                          <button onClick={() => deleteReport(r.id)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    {isExpanded && (
                      <tr className="bg-black/30 border-b border-white/5">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="text-xs text-white/50 mb-2 font-semibold uppercase">Complaint Full Content</div>
                          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-3xl mb-3">{r.content}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            {[
                              ['Office', r.office],
                              ['Thana', r.thana],
                              ['Date', r.date],
                              ['Outcome', r.outcome],
                            ].map(([k, v]) => (
                              <div key={k}>
                                <div className="text-white/40 mb-0.5">{k}</div>
                                <div className="text-white/80 font-medium">{v || '—'}</div>
                              </div>
                            ))}
                          </div>
                          {r.comments?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="text-white/40 text-xs mb-2">Comments ({r.comments.length})</div>
                              <div className="space-y-1">
                                {r.comments.slice(0, 2).map(c => (
                                  <div key={c.id} className="text-xs text-white/60">
                                    <span className="text-white/40">{c.author}:</span> {c.text}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-white/40 text-center sm:text-left">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 transition cursor-pointer">Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${p === page ? 'bg-green-500 text-white shadow-xs' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 transition cursor-pointer">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}