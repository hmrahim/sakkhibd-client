import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReports } from '../context/ReportContext';
import { getBlogByIdApi, reactToBlogApi } from '../api/blogApi';
import ReactionBar from '../components/ReactionBar';
import { ChevronLeft, Eye, Calendar, User } from 'lucide-react';

const ArticleDetail = () => {
  const { id } = useParams();
  const { lang, triggerToast } = useReports();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getBlogByIdApi(id)
      .then((res) => {
        if (!cancelled) setBlog(res?.data || null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleReact = async (reactionType) => {
    if (!blog) return;
    const previous = { reactions: { ...(blog.reactions || {}) }, userReaction: blog.userReaction };

    // Optimistic update
    setBlog((prev) => {
      const reactions = { ...(prev.reactions || { like: 0, love: 0, angry: 0, sad: 0, wow: 0 }) };
      const isToggleOff = prev.userReaction === reactionType;
      if (isToggleOff) {
        reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
      } else {
        if (prev.userReaction && reactions[prev.userReaction] !== undefined) {
          reactions[prev.userReaction] = Math.max(0, reactions[prev.userReaction] - 1);
        }
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
      }
      return { ...prev, reactions, userReaction: isToggleOff ? null : reactionType };
    });

    try {
      const res = await reactToBlogApi(id, { reactionType });
      const serverData = res?.data || res;
      if (serverData?.reactions !== undefined) {
        setBlog((prev) => ({
          ...prev,
          reactions: serverData.reactions,
          userReaction: serverData.userReaction !== undefined ? serverData.userReaction : prev.userReaction,
        }));
      }
    } catch (err) {
      triggerToast(lang === 'bn' ? 'রিয়েক্ট দিতে সমস্যা হয়েছে।' : 'Failed to react.', 'error');
      setBlog((prev) => ({ ...prev, reactions: previous.reactions, userReaction: previous.userReaction }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-8 w-2/3 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="h-56 w-full bg-gray-100 rounded-2xl animate-pulse mb-4" />
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-lg font-semibold">{lang === 'bn' ? 'আর্টিকেলটি পাওয়া যায়নি।' : 'Article not found.'}</p>
        <Link to="/articles" className="text-[#006A4E] font-bold text-sm hover:underline mt-3 inline-block">
          {lang === 'bn' ? 'সব আর্টিকেল দেখুন' : 'Back to articles'}
        </Link>
      </div>
    );
  }

  const reactions = blog.reactions || { like: blog.likes || 0, love: 0, angry: 0, sad: 0, wow: 0 };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-[#006A4E] font-bold hover:underline mb-4">
        <ChevronLeft size={16} /> {lang === 'bn' ? 'সব আর্টিকেল' : 'All articles'}
      </Link>

      <span className="text-xs font-bold text-[#006A4E] bg-[#e8f5f0] rounded-full px-3 py-1 w-fit inline-block mb-3">
        {blog.category}
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug mb-3">{blog.title}</h1>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
        <span className="flex items-center gap-1"><User size={12} /> {blog.author}</span>
        <span className="flex items-center gap-1">
          <Calendar size={12} /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
        </span>
        <span className="flex items-center gap-1"><Eye size={12} /> {blog.views || 0}</span>
      </div>

      {blog.coverImage && (
        <img src={blog.coverImage} alt={blog.title} className="w-full max-h-96 object-cover rounded-2xl mb-6 border border-gray-100" />
      )}

      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
        {blog.content}
      </div>

      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {blog.tags.map((tag) => (
            <span key={tag} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <ReactionBar
          targetType="blog"
          targetId={blog._id || blog.id}
          reactions={reactions}
          userReaction={blog.userReaction}
          onReact={handleReact}
          lang={lang}
        />
      </div>
    </div>
  );
};

export default ArticleDetail;
