import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useReports } from '../context/ReportContext';
import { getReportsApi } from '../api/reportApi';
import ReportCard, { OutcomeBadge } from '../components/ReportCard';
import { DIVISION_DISTRICTS, CATEGORY_NAMES_TRANSLATION } from '../data/initialData';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { PlusCircle, Search, LayoutGrid, List, RotateCcw, Loader2 } from 'lucide-react';

const PAGE_SIZE = 24;

// Normalize a raw report coming straight from the backend so it has the
// same shape the rest of the UI (ReportCard / DetailModal) expects.
const normalizeReport = (r) => ({
  ...r,
  id: r.id || r._id,
  reactions: r.reactions || { like: r.likes || 0, love: 0, angry: 0, sad: 0, wow: 0 },
  userReaction: r.userReaction || null,
  comments: r.comments || [],
  photos: r.proofImages || r.photos || [],
});

const Blogs = () => {
  const { setIsSubmitModalOpen, setSelectedReport, t, lang } = useReports();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedThana, setSelectedThana] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const availableDistricts = selectedDivision ? (DIVISION_DISTRICTS[selectedDivision] || []) : [];

  // Debounce free-text inputs so we don't hit the backend on every keystroke
  const debouncedSearch = useDebouncedValue(searchQuery, 400);
  const debouncedThana = useDebouncedValue(selectedThana, 400);

  // Backend query params built from the current filter selections
  // (excludes `page`, which is tracked separately for "Load More")
  const baseFilterParams = useMemo(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedDivision) params.division = selectedDivision;
    if (selectedDistrict) params.district = selectedDistrict;
    if (debouncedThana.trim()) params.thana = debouncedThana.trim();
    if (selectedCategory) params.category = selectedCategory;
    if (selectedOutcome) params.outcome = selectedOutcome;

    if (sortBy === 'amount-desc') { params.sortBy = 'amount'; params.order = 'desc'; }
    else if (sortBy === 'amount-asc') { params.sortBy = 'amount'; params.order = 'asc'; }
    else if (sortBy === 'likes') { params.sortBy = 'likes'; params.order = 'desc'; }
    else { params.sortBy = 'createdAt'; params.order = 'desc'; }

    return params;
  }, [debouncedSearch, selectedDivision, selectedDistrict, debouncedThana, selectedCategory, selectedOutcome, sortBy]);

  const [page, setPage] = useState(1);
  const [loadedReports, setLoadedReports] = useState([]);
  const [totalMatching, setTotalMatching] = useState(0);

  // Any time the actual filter criteria changes, go back to page 1
  useEffect(() => {
    setPage(1);
  }, [baseFilterParams]);

  // Dynamic, server-side filtering — this queries the FULL dataset in the
  // database (not just whatever was already cached on the client), so
  // filters can actually surface every matching complaint.
  const {
    data: pageResult,
    isFetching: isBlogsLoading,
    isError: isBlogsError,
  } = useQuery({
    queryKey: ['reports', 'blogs-filtered', baseFilterParams, page],
    queryFn: async () => {
      return await getReportsApi({ ...baseFilterParams, page, limit: PAGE_SIZE });
    },
    keepPreviousData: true,
    staleTime: 1000 * 20,
  });

  // Accumulate pages into one flat list; page 1 replaces, further pages append
  useEffect(() => {
    if (!pageResult) return;
    const normalized = (pageResult.data || []).map(normalizeReport);
    setLoadedReports(prev => (page === 1 ? normalized : [...prev, ...normalized]));
    setTotalMatching(pageResult.total ?? normalized.length);
  }, [pageResult, page]);

  const hasMore = loadedReports.length < totalMatching;
  const isFirstLoad = isBlogsLoading && page === 1 && loadedReports.length === 0;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDivision('');
    setSelectedDistrict('');
    setSelectedThana('');
    setSelectedCategory('');
    setSelectedOutcome('');
  };

  const hasActiveFilters = !!(selectedDivision || selectedDistrict || selectedThana || selectedCategory || selectedOutcome || searchQuery);

  return (
    <div>
      {/* Page Header */}
      <div className="bg-[#006A4E] py-12 px-4 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2">{t.blogsTitle}</h1>
        <p className="text-green-200 text-sm">{t.blogsSubtitle}</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white shadow sticky top-16 z-40 px-4 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Row 1: Search & Action button */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.blogsSearchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E] bg-gray-50"
              />
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-[#F42A41] hover:bg-[#c0172c] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={15} /> {t.newComplaintBtn}
            </button>
          </div>

          {/* Row 2: Location and Other Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Division */}
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict('');
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none cursor-pointer"
            >
              <option value="">{t.allDivisions}</option>
              {Object.keys(DIVISION_DISTRICTS).map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>

            {/* District */}
            <select
              value={selectedDistrict}
              disabled={!selectedDivision}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">{selectedDivision ? t.allDistricts : t.selectDivisionFirst}</option>
              {availableDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Thana */}
            <input
              type="text"
              value={selectedThana}
              onChange={(e) => setSelectedThana(e.target.value)}
              placeholder={t.thanaPlaceholder}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none"
            />

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none cursor-pointer"
            >
              <option value="">{t.allCategories}</option>
              {Object.entries(CATEGORY_NAMES_TRANSLATION).map(([value, label]) => (
                <option key={value} value={value}>
                  {lang === 'bn' ? label.bn : label.en}
                </option>
              ))}
            </select>

            {/* Outcome */}
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="">{t.allOutcomes}</option>
              <option value="পরিশোধিত">{t.paid}</option>
              <option value="প্রত্যাখ্যাত">{t.refused}</option>
              <option value="দাবি মুলতুবি">{t.pending}</option>
              <option value="ভুক্তভোগী">{t.victim}</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none cursor-pointer"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="amount-desc">{t.sortAmountDesc}</option>
              <option value="amount-asc">{t.sortAmountAsc}</option>
              <option value="likes">{t.sortReactions}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result count & view switcher */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {isBlogsLoading && page === 1 ? (
            <span className="flex items-center gap-1.5 text-[#006A4E]">
              <Loader2 size={12} className="animate-spin" /> {t.searchingText}
            </span>
          ) : (
            <span><strong>{totalMatching}</strong> {t.reportsFound}</span>
          )}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[#006A4E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={11} /> {t.resetFilters}
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 cursor-pointer ${
              viewMode === 'grid' 
                ? 'border-[#006A4E] bg-[#006A4E] text-white' 
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            <LayoutGrid size={13} /> {t.gridView}
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 cursor-pointer ${
              viewMode === 'table' 
                ? 'border-[#006A4E] bg-[#006A4E] text-white' 
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            <List size={13} /> {t.tableView}
          </button>
        </div>
      </div>

      {/* Reports Display Container */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {isFirstLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        ) : isBlogsError ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-xl font-semibold">
              {lang === 'bn' ? 'তথ্য আনতে সমস্যা হয়েছে।' : 'Failed to load complaints.'}
            </p>
          </div>
        ) : loadedReports.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold">{t.noReportsFound}</p>
            <p className="text-xs mt-1">{t.tryChangingFilters}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {loadedReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Load More / pagination — lets users pull every matching
                complaint, not only the first page returned by the API */}
            <div className="flex flex-col items-center mt-8 gap-2">
              {hasMore ? (
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={isBlogsLoading}
                  className="bg-white border border-[#006A4E] text-[#006A4E] hover:bg-[#006A4E] hover:text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isBlogsLoading && page > 1 ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> {t.loadingMoreText}
                    </>
                  ) : (
                    t.loadMoreBtn
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-gray-400">{t.allLoadedText}</span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-x-auto mt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#e8f5f0] text-[#004d38] font-bold uppercase border-b border-green-200">
                  <tr>
                    <th className="p-3">{t.tableAmount}</th>
                    <th className="p-3">{t.tableOutcome}</th>
                    <th className="p-3">{t.tableTitleDept}</th>
                    <th className="p-3">{t.tableLocation}</th>
                    <th className="p-3">{t.tableOfficial}</th>
                    <th className="p-3">{t.tableDate}</th>
                    <th className="p-3 text-right">{t.tableReactionsComments}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {loadedReports.map(b => {
                    const reactions = b.reactions || { like: b.likes || 0 };
                    const total = Object.values(reactions).reduce((x, y) => x + y, 0);
                    const commentsCount = (b.comments || []).length;
                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-green-50/50 cursor-pointer"
                        onClick={() => setSelectedReport(b)}
                      >
                        <td className="p-3 font-mono font-bold text-[#F42A41]">
                          ৳{b.amount.toLocaleString('en-US')}
                        </td>
                        <td className="p-3"><OutcomeBadge outcome={b.outcome} lang={lang} /></td>
                        <td className="p-3">
                          <div className="font-bold text-gray-800">{b.title}</div>
                          <div className="text-[11px] text-gray-500">{b.office}</div>
                        </td>
                        <td className="p-3 text-gray-600 font-mono">
                          {b.division.replace(' বিভাগ', '')}, {b.district} ({b.thana || (lang === 'bn' ? 'অনির্দিষ্ট' : 'N/A')})
                        </td>
                        <td className="p-3 text-[#F42A41] font-medium">
                          {b.official || '—'}
                        </td>
                        <td className="p-3 text-gray-400 font-mono">{b.date}</td>
                        <td className="p-3 text-right font-bold text-gray-700">
                          👍 {total} • 💬 {commentsCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center mt-8 gap-2">
              {hasMore ? (
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={isBlogsLoading}
                  className="bg-white border border-[#006A4E] text-[#006A4E] hover:bg-[#006A4E] hover:text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isBlogsLoading && page > 1 ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> {t.loadingMoreText}
                    </>
                  ) : (
                    t.loadMoreBtn
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-gray-400">{t.allLoadedText}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Blogs;