import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useReports } from '../context/ReportContext';
import CommentSection from './CommentSection';
import { Building, MapPin, Calendar, Scale, MessageCircle, Share2, ThumbsUp, Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { COMPLAINT_TYPES } from '../data/initialData';

const OutcomeBadge = ({ outcome, lang = 'bn' }) => {
  if (outcome === 'পরিশোধিত' || outcome === 'Paid') {
    return <span className="badge-paid text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold">{lang === 'bn' ? '🔴 পরিশোধিত' : '🔴 Paid'}</span>;
  }
  if (outcome === 'প্রত্যাখ্যাত' || outcome === 'Refused') {
    return <span className="badge-refused text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold">{lang === 'bn' ? '✅ প্রত্যাখ্যাত' : '✅ Refused'}</span>;
  }
  if (outcome === 'ভুক্তভোগী' || outcome === 'Victim') {
    return <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold">{lang === 'bn' ? '🟠 ভুক্তভোগী' : '🟠 Victim'}</span>;
  }
  return <span className="badge-pending text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold">{lang === 'bn' ? '🟡 দাবি মুলতুবি' : '🟡 Pending'}</span>;
};

const TypeBadge = ({ complaintType, lang = 'bn' }) => {
  const type = COMPLAINT_TYPES.find(t => t.id === complaintType);
  if (!type) return null;
  
  const colorMap = {
    government: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    political: 'bg-purple-100 text-purple-700 border-purple-200',
    private: 'bg-blue-100 text-blue-700 border-blue-200',
    social: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const labelMap = {
    government: lang === 'bn' ? 'সরকারি' : 'Govt',
    political: lang === 'bn' ? 'রাজনৈতিক' : 'Political',
    private: lang === 'bn' ? 'বেসরকারি' : 'Private',
    social: lang === 'bn' ? 'সামাজিক' : 'Social',
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${colorMap[complaintType] || ''}`}>
      {labelMap[complaintType] || type.shortLabel}
    </span>
  );
};

const getReactionConfig = (lang) => [
  { type: 'like', emoji: '👍', label: lang === 'bn' ? 'লাইক' : 'Like', color: 'text-blue-600' },
  { type: 'love', emoji: '❤️', label: lang === 'bn' ? 'লাভ' : 'Love', color: 'text-rose-600' },
  { type: 'angry', emoji: '😡', label: lang === 'bn' ? 'ক্ষোভ' : 'Angry', color: 'text-amber-700' },
  { type: 'sad', emoji: '😢', label: lang === 'bn' ? 'দুঃখিত' : 'Sad', color: 'text-amber-500' },
  { type: 'wow', emoji: '😮', label: lang === 'bn' ? 'হতবাক' : 'Wow', color: 'text-yellow-600' },
];

const ReportCard = ({ report }) => {
  const { setSelectedReport, reactToReport, triggerToast, t, lang } = useReports();
  const [showReactionsBar, setShowReactionsBar] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const photos = report.photos || [];
  const reportId = report.id || report._id;
  const REACTION_CONFIG = getReactionConfig(lang);

  const barColorMap = {
    government: 'from-[#006A4E] to-[#004d38]',
    political: 'from-purple-500 to-purple-700',
    private: 'from-blue-500 to-blue-700',
    social: 'from-orange-500 to-orange-700',
  };
  const barColor = barColorMap[report.complaintType] || barColorMap.government;

  const reactions = report.reactions || { like: report.likes || 0, love: 0, angry: 0, sad: 0, wow: 0 };
  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const commentsCount = report.commentsCount ?? (report.comments || []).length;
  const currentReactionObj = REACTION_CONFIG.find(r => r.type === report.userReaction);

  const handleQuickReaction = (e) => {
    e.stopPropagation();
    if (report.userReaction) {
      reactToReport(report.id, report.userReaction);
    } else {
      reactToReport(report.id, 'like');
    }
  };

  const handleSelectReaction = (e, type) => {
    e.stopPropagation();
    reactToReport(report.id, type);
    setShowReactionsBar(false);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: report.content,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast(t.linkCopied);
    }
  };

  return (
    <div 
      className="card-hover bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md"
    >
      <div className={`bg-gradient-to-r ${barColor} h-2`}></div>
      
      {/* Clickable Card Body */}
      <div 
        className="p-5 flex-1 flex flex-col justify-between cursor-pointer"
        onClick={() => setSelectedReport(report)}
      >
        <div>
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <OutcomeBadge outcome={report.outcome} lang={lang} />
              <TypeBadge complaintType={report.complaintType} lang={lang} />
              <span className="bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded-full font-medium">
                {report.category}
              </span>
              <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                <MapPin size={10} /> {report.district} {report.thana ? `(${report.thana})` : ''}
              </span>
            </div>
            <div className="text-sm font-extrabold font-mono text-[#F42A41]">
              ৳{report.amount.toLocaleString('en-US')}
            </div>
          </div>

          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-2 line-clamp-2 hover:text-[#006A4E] transition-colors">
            {report.title}
          </h3>

          <p className="text-gray-600 text-xs leading-relaxed mb-4 line-clamp-3">
            {report.content}
          </p>

          {/* Facebook-style Photo Grid */}
          {photos.length > 0 && (
            <div
              className="mb-3 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.length === 1 && (
                <div
                  className="relative group cursor-pointer h-52 w-full"
                  onClick={() => setLightboxIndex(0)}
                >
                  <img
                    src={photos[0]}
                    alt="proof"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 size={28} className="text-white drop-shadow-lg" />
                  </div>
                </div>
              )}

              {photos.length === 2 && (
                <div className="grid grid-cols-2 gap-0.5 h-40 rounded-xl overflow-hidden">
                  {photos.map((url, i) => (
                    <div
                      key={i}
                      className="relative group cursor-pointer"
                      onClick={() => setLightboxIndex(i)}
                    >
                      <img src={url} alt="proof" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 size={20} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {photos.length >= 3 && (
                <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden" style={{ height: '11rem' }}>
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => setLightboxIndex(0)}
                  >
                    <img src={photos[0]} alt="proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 size={22} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="grid grid-rows-2 gap-0.5 h-full">
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setLightboxIndex(1)}
                    >
                      <img src={photos[1]} alt="proof" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 size={18} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setLightboxIndex(2)}
                    >
                      <img src={photos[2]} alt="proof" className="w-full h-full object-cover" />
                      {photos.length > 3 ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xl font-bold drop-shadow">+{photos.length - 3}</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Maximize2 size={18} className="text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Office & Meta */}
        <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 space-y-1.5">
          <div className="text-gray-700 font-medium flex items-center gap-1">
            <Building size={12} /> {report.office}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar size={11} /> {report.date}
            </span>
            <span className="text-gray-600 font-medium">
              {report.author === 'নাম প্রকাশে অনিচ্ছুক' ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : report.author}
            </span>
          </div>
          {report.official && (
            <div className="text-[#F42A41] text-[11px] font-semibold flex items-center gap-1">
              <Scale size={11} /> {report.official} {report.officialPost ? `(${report.officialPost})` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Facebook-style Reaction & Comment Summary Bar */}
      <div className="px-5 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 select-none">
        <div className="flex items-center gap-1.5">
          {totalReactions > 0 ? (
            <div className="relative group flex items-center gap-1.5 cursor-default">
              {/* Per-reaction breakdown: emoji + count for each reaction > 0, sorted by count */}
              <div className="flex items-center gap-1">
                {REACTION_CONFIG
                  .filter(r => reactions[r.type] > 0)
                  .sort((a, b) => reactions[b.type] - reactions[a.type])
                  .map(r => (
                    <span key={r.type} className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-full px-1.5 py-0.5">
                      <span className="text-xs leading-none">{r.emoji}</span>
                      <span className="text-[10px] font-semibold text-gray-600">{reactions[r.type]}</span>
                    </span>
                  ))
                }
              </div>

              {/* Hover Tooltip: Full breakdown */}
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-gray-900 text-white rounded-xl shadow-xl px-3 py-2 flex-col gap-1 z-40 min-w-max text-[11px]">
                {REACTION_CONFIG
                  .filter(r => reactions[r.type] > 0)
                  .sort((a, b) => reactions[b.type] - reactions[a.type])
                  .map(r => (
                    <div key={r.type} className="flex items-center gap-2">
                      <span>{r.emoji}</span>
                      <span>{r.label}</span>
                      <span className="ml-auto font-bold">{reactions[r.type]}</span>
                    </div>
                  ))
                }
                <div className="border-t border-gray-600 mt-1 pt-1 flex items-center justify-between font-semibold">
                  <span>{t.reactionsCount}</span>
                  <span>{totalReactions}</span>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-gray-400">{t.firstReactPrompt}</span>
          )}
        </div>

        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }}
          className="text-[11px] hover:underline cursor-pointer text-gray-500 flex items-center gap-1"
        >
          {commentsCount} {t.commentsCount}
        </button>
      </div>

      {/* Facebook-style Action Buttons */}
      <div className="px-2 py-1 border-t border-gray-100 grid grid-cols-3 gap-1 relative bg-gray-50/50">
        
        {/* Floating Reaction Picker */}
        {showReactionsBar && (
          <div 
            className="absolute bottom-full left-2 mb-2 bg-white rounded-full shadow-2xl border border-gray-200 px-3 py-1.5 flex items-center gap-2 z-30 animate-fade-in"
            onMouseLeave={() => setShowReactionsBar(false)}
          >
            {REACTION_CONFIG.map(r => (
              <button
                key={r.type}
                type="button"
                onClick={(e) => handleSelectReaction(e, r.type)}
                className="transform hover:scale-130 transition-transform p-1 text-xl cursor-pointer"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}

        {/* React Button with Hover / Click */}
        <div 
          className="relative"
          onMouseEnter={() => setShowReactionsBar(true)}
        >
          <button
            type="button"
            onClick={handleQuickReaction}
            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-gray-100 ${
              currentReactionObj ? currentReactionObj.color : 'text-gray-600'
            }`}
          >
            {currentReactionObj ? (
              <>
                <span className="text-base leading-none">{currentReactionObj.emoji}</span>
                <span>{currentReactionObj.label}</span>
              </>
            ) : (
              <>
                <ThumbsUp size={14} />
                <span>{t.reactBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Comment Toggle Button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }}
          className="w-full py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <MessageCircle size={14} />
          <span>{t.commentBtn}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Share2 size={14} />
          <span>{t.shareBtn}</span>
        </button>
      </div>

      {/* Expandable Comments Section (real Comment API — replies, likes, edit/delete, identity tracked) */}
      {showCommentBox && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 animate-fade-in" onClick={e => e.stopPropagation()}>
          <CommentSection reportId={reportId} />
        </div>
      )}

      {/* Fullscreen Lightbox — rendered via portal so it always covers the
          full viewport, regardless of the card's own transform/overflow */}
      {lightboxIndex !== null && photos.length > 0 && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            type="button"
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
          >
            <X size={22} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-mono bg-black/40 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full p-2.5 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length); }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
          <img
            src={photos[lightboxIndex]}
            alt={`proof ${lightboxIndex + 1}`}
            className="max-h-[88vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {photos.length > 1 && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full p-2.5 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % photos.length); }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 bg-black/40 rounded-2xl">
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`thumb ${i + 1}`}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`h-12 w-16 object-cover rounded-lg cursor-pointer transition-all border-2 ${
                    i === lightboxIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export { OutcomeBadge, TypeBadge };
export default ReportCard;