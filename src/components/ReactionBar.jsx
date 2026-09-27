import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import ReactorsModal from './ReactorsModal';

export const REACTION_CONFIG = (lang) => [
  { type: 'like', emoji: '👍', label: lang === 'bn' ? 'লাইক' : 'Like', color: 'text-blue-600' },
  { type: 'love', emoji: '❤️', label: lang === 'bn' ? 'লাভ' : 'Love', color: 'text-rose-600' },
  { type: 'angry', emoji: '😡', label: lang === 'bn' ? 'ক্ষোভ' : 'Angry', color: 'text-amber-700' },
  { type: 'sad', emoji: '😢', label: lang === 'bn' ? 'দুঃখিত' : 'Sad', color: 'text-amber-500' },
  { type: 'wow', emoji: '😮', label: lang === 'bn' ? 'হতবাক' : 'Wow', color: 'text-yellow-600' },
];

/**
 * পুনর্ব্যবহারযোগ্য Facebook-style রিয়েকশন বার — Report ও Blog দুটোতেই ব্যবহারযোগ্য।
 * কাউন্ট সামারি ক্লিক করলে "কে কোন রিয়েক্ট দিয়েছে" মডাল খোলে।
 *
 * Props:
 *  - targetType: 'report' | 'blog'
 *  - targetId: string
 *  - reactions: { like, love, angry, sad, wow }
 *  - userReaction: string | null
 *  - onReact: (reactionType) => void
 *  - lang: 'bn' | 'en'
 *  - reactLabel / firstReactLabel / reactionsCountLabel: optional label overrides
 */
const ReactionBar = ({
  targetType,
  targetId,
  reactions = {},
  userReaction,
  onReact,
  lang = 'bn',
  reactLabel,
  firstReactLabel,
  reactionsCountLabel,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showReactors, setShowReactors] = useState(false);

  const CONFIG = REACTION_CONFIG(lang);
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);
  const current = CONFIG.find((r) => r.type === userReaction);

  const handleQuickReaction = () => onReact(userReaction || 'like');

  return (
    <div>
      {/* সারাংশ — কাউন্ট পিল, ক্লিক করলে who-reacted মডাল */}
      <div className="flex items-center justify-between py-2 text-xs text-gray-600 mb-2">
        {total > 0 ? (
          <button
            type="button"
            onClick={() => setShowReactors(true)}
            className="flex items-center gap-1 cursor-pointer"
            title={lang === 'bn' ? 'কে কোন রিয়েক্ট দিয়েছে দেখুন' : 'See who reacted'}
          >
            {CONFIG.filter((r) => reactions[r.type] > 0)
              .sort((a, b) => reactions[b.type] - reactions[a.type])
              .map((r) => (
                <span key={r.type} className="flex items-center gap-0.5 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
                  <span className="text-sm leading-none">{r.emoji}</span>
                  <span className="text-[11px] font-semibold text-gray-700">{reactions[r.type]}</span>
                </span>
              ))}
            <span className="ml-1 text-[11px] text-gray-400 hover:underline">
              {total} {reactionsCountLabel || (lang === 'bn' ? 'জন প্রতিক্রিয়া' : 'reactions')}
            </span>
          </button>
        ) : (
          <span className="text-gray-400">{firstReactLabel || (lang === 'bn' ? 'প্রথম প্রতিক্রিয়া দিন' : 'Be first to react')}</span>
        )}
      </div>

      {/* Action button + hover picker */}
      <div className="relative">
        {showPicker && (
          <div
            className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-2xl border border-gray-200 px-3 py-1.5 flex items-center gap-2 z-30 animate-fade-in"
            onMouseLeave={() => setShowPicker(false)}
          >
            {CONFIG.map((r) => (
              <button
                key={r.type}
                type="button"
                onClick={() => {
                  onReact(r.type);
                  setShowPicker(false);
                }}
                className="transform hover:scale-130 transition-transform p-1 text-2xl cursor-pointer"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}

        <div className="relative" onMouseEnter={() => setShowPicker(true)}>
          <button
            onClick={handleQuickReaction}
            className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-gray-200 bg-gray-50 hover:bg-gray-100 ${
              current ? current.color : 'text-gray-700'
            }`}
          >
            {current ? (
              <>
                <span className="text-lg leading-none">{current.emoji}</span>
                <span>{current.label}</span>
              </>
            ) : (
              <>
                <ThumbsUp size={16} />
                <span>{reactLabel || (lang === 'bn' ? 'রিয়েক্ট' : 'React')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showReactors && (
        <ReactorsModal
          targetType={targetType}
          targetId={targetId}
          reactions={reactions}
          lang={lang}
          onClose={() => setShowReactors(false)}
        />
      )}
    </div>
  );
};

export default ReactionBar;
