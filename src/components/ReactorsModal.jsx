import React, { useEffect, useState } from 'react';
import { X, User } from 'lucide-react';
import { getReportReactorsApi } from '../api/reportApi';
import { getBlogReactorsApi } from '../api/blogApi';

const REACTION_META = {
  like: { emoji: '👍', label_bn: 'লাইক', label_en: 'Like' },
  love: { emoji: '❤️', label_bn: 'লাভ', label_en: 'Love' },
  angry: { emoji: '😡', label_bn: 'ক্ষোভ', label_en: 'Angry' },
  sad: { emoji: '😢', label_bn: 'দুঃখিত', label_en: 'Sad' },
  wow: { emoji: '😮', label_bn: 'হতবাক', label_en: 'Wow' },
};

const timeAgo = (dateStr, lang) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return lang === 'bn' ? 'এইমাত্র' : 'just now';
  if (mins < 60) return lang === 'bn' ? `${mins} মিনিট আগে` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === 'bn' ? `${hrs} ঘণ্টা আগে` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return lang === 'bn' ? `${days} দিন আগে` : `${days}d ago`;
};

/**
 * Facebook-style "কে কোন রিয়েক্ট দিয়েছে" মডাল।
 *
 * Props:
 *  - targetType: 'report' | 'blog'
 *  - targetId: string
 *  - reactions: { like, love, angry, sad, wow } — কাউন্ট (ট্যাব ব্যাজে দেখানোর জন্য)
 *  - onClose: () => void
 *  - lang: 'bn' | 'en'
 */
const ReactorsModal = ({ targetType, targetId, reactions = {}, onClose, lang = 'bn' }) => {
  const [reactors, setReactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const fetcher = targetType === 'blog' ? getBlogReactorsApi : getReportReactorsApi;

    fetcher(targetId)
      .then((res) => {
        if (cancelled) return;
        setReactors(res?.data || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  const availableTypes = Object.keys(REACTION_META).filter((type) => (reactions[type] || 0) > 0);
  const filtered = activeTab === 'all' ? reactors : reactors.filter((r) => r.reactionType === activeTab);
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden animate-slide-up border border-gray-100">
        {/* Header with tabs */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {lang === 'bn' ? 'সব' : 'All'} {total}
            </button>
            {availableTypes
              .sort((a, b) => (reactions[b] || 0) - (reactions[a] || 0))
              .map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                    activeTab === type ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span>{REACTION_META[type].emoji}</span>
                  <span>{reactions[type]}</span>
                </button>
              ))}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 shrink-0 ml-2 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-2 py-2">
          {loading ? (
            <div className="py-10 text-center text-xs text-gray-400">
              {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
            </div>
          ) : error ? (
            <div className="py-10 text-center text-xs text-gray-400">
              {lang === 'bn' ? 'তালিকা আনতে সমস্যা হয়েছে।' : 'Failed to load reactions.'}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              {lang === 'bn' ? 'এখনো কেউ রিয়েক্ট দেয়নি।' : 'No reactions yet.'}
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50"
              >
                <div className="relative shrink-0">
                  {r.photo ? (
                    <img src={r.photo} alt={r.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                      <User size={16} />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 text-sm leading-none bg-white rounded-full">
                    {REACTION_META[r.reactionType]?.emoji}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {r.name} {r.isYou && <span className="text-[10px] text-gray-400 font-normal">({lang === 'bn' ? 'আপনি' : 'you'})</span>}
                  </div>
                  <div className="text-[11px] text-gray-400">{timeAgo(r.reactedAt, lang)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactorsModal;
