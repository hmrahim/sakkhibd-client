import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useReports } from '../context/ReportContext';
import { getBlogsApi } from '../api/blogApi';
import { Search, Eye, Loader2, Calendar } from 'lucide-react';

const REACTION_EMOJI = { like: '👍', love: '❤️', angry: '😡', sad: '😢', wow: '😮' };

const ArticleCard = ({ blog, lang }) => {
  const reactions = blog.reactions || { like: blog.likes || 0, love: 0, angry: 0, sad: 0, wow: 0 };
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);
  const topTypes = Object.entries(reactions)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Link
      to={`/articles/${blog._id || blog.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
    >
      {blog.coverImage ? (
        <img src={blog.coverImage} alt={blog.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-[#006A4E] to-[#004d38] flex items-center justify-center text-white text-4xl">
          📰
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-[11px] font-bold text-[#006A4E] bg-[#e8f5f0] rounded-full px-2.5 py-0.5 w-fit mb-2">
          {blog.category}
        </span>
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5 group-hover:text-[#006A4E] transition-colors line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{blog.excerpt}</p>

        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</span>
          <div className="flex items-center gap-2">
            {total > 0 && (
              <span className="flex items-center gap-0.5">
                {topTypes.map(([type]) => <span key={type}>{REACTION_EMOJI[type]}</span>)} {total}
              </span>
            )}
            <span className="flex items-center gap-0.5"><Eye size={11} /> {blog.views || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Articles = () => {
  const { lang } = useReports();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loadedBlogs, setLoadedBlogs] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isFetching, isError } = useQuery({
    queryKey: ['blogs', search, page],
    queryFn: () => getBlogsApi({ search: search.trim() || undefined, page, limit: 12 }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!data) return;
    setLoadedBlogs((prev) => (page === 1 ? (data.data || []) : [...prev, ...(data.data || [])]));
    setTotal(data.total ?? 0);
  }, [data, page]);

  const blogs = loadedBlogs;

  return (
    <div>
      <div className="bg-[#006A4E] py-12 px-4 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2">
          {lang === 'bn' ? '📰 সচেতনতা ও আইন — আর্টিকেল' : '📰 Awareness & Legal Articles'}
        </h1>
        <p className="text-green-200 text-sm">
          {lang === 'bn' ? 'দুর্নীতির বিরুদ্ধে সচেতনতামূলক লেখা ও আইনি গাইড' : 'Articles and legal guides to help you fight corruption'}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={lang === 'bn' ? 'আর্টিকেল খুঁজুন...' : 'Search articles...'}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E] bg-white"
          />
        </div>

        {isFetching && page === 1 && blogs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-lg font-semibold">{lang === 'bn' ? 'আর্টিকেল আনতে সমস্যা হয়েছে।' : 'Failed to load articles.'}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-semibold">{lang === 'bn' ? 'কোনো আর্টিকেল পাওয়া যায়নি।' : 'No articles found.'}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {blogs.map((b) => <ArticleCard key={b._id || b.id} blog={b} lang={lang} />)}
            </div>
            {blogs.length < total && (
              <div className="flex justify-center pb-16">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                  className="bg-white border border-[#006A4E] text-[#006A4E] hover:bg-[#006A4E] hover:text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isFetching ? <Loader2 size={14} className="animate-spin" /> : null}
                  {lang === 'bn' ? 'আরও দেখুন' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Articles;
