import React, { useState } from 'react';
import { useReports } from '../context/ReportContext';
import { OutcomeBadge, TypeBadge } from './ReportCard';
import { Share2, MapPin, Building, Calendar, Scale, AlertCircle, Image, X, User, EyeOff, ChevronLeft, ChevronRight, ThumbsUp, MessageCircle, Send } from 'lucide-react';

const getReactionConfig = (lang) => [
  { type: 'like', emoji: '👍', label: lang === 'bn' ? 'লাইক' : 'Like', color: 'text-blue-600' },
  { type: 'love', emoji: '❤️', label: lang === 'bn' ? 'লাভ' : 'Love', color: 'text-rose-600' },
  { type: 'angry', emoji: '😡', label: lang === 'bn' ? 'ক্ষোভ' : 'Angry', color: 'text-amber-700' },
  { type: 'sad', emoji: '😢', label: lang === 'bn' ? 'দুঃখিত' : 'Sad', color: 'text-amber-500' },
  { type: 'wow', emoji: '😮', label: lang === 'bn' ? 'হতবাক' : 'Wow', color: 'text-yellow-600' },
];

const DetailModal = () => {
  const { selectedReport, setSelectedReport, reactToReport, addComment, triggerToast, t, lang } = useReports();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [showReactionsBar, setShowReactionsBar] = useState(false);

  if (!selectedReport) return null;

  const photos = selectedReport.photos || [];
  const hasPhotos = photos.length > 0;
  const reactions = selectedReport.reactions || { like: selectedReport.likes || 0, love: 0, angry: 0, sad: 0, wow: 0 };
  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const comments = selectedReport.comments || [];
  const REACTION_CONFIG = getReactionConfig(lang);
  const currentReactionObj = REACTION_CONFIG.find(r => r.type === selectedReport.userReaction);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedReport.title,
        text: selectedReport.content,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast(t.linkCopied);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(selectedReport.id, commentInput, commenterName);
    setCommentInput('');
  };

  const handleQuickReaction = () => {
    if (selectedReport.userReaction) {
      reactToReport(selectedReport.id, selectedReport.userReaction);
    } else {
      reactToReport(selectedReport.id, 'like');
    }
  };

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex(prev => prev > 0 ? prev - 1 : photos.length - 1);
  const nextPhoto = () => setLightboxIndex(prev => prev < photos.length - 1 ? prev + 1 : 0);

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-10 overflow-y-auto bg-black/75 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedReport(null);
        }}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden my-6 animate-slide-up border border-gray-100">
          {/* Close Button */}
          <button 
            onClick={() => setSelectedReport(null)}
            className="absolute top-4 right-5 text-gray-400 hover:text-gray-700 text-3xl z-10 leading-none cursor-pointer"
          >
            &times;
          </button>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <OutcomeBadge outcome={selectedReport.outcome} lang={lang} />
                <TypeBadge complaintType={selectedReport.complaintType} lang={lang} />
                <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                  {selectedReport.category}
                </span>
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                  <MapPin size={11} /> {selectedReport.district}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#F42A41]">
                ৳{selectedReport.amount.toLocaleString('en-US')}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug mb-4">
              {selectedReport.title}
            </h2>

            {/* Details Table Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#e8f5f0] rounded-2xl p-4 text-xs text-gray-700 mb-5 font-sans border border-green-200">
              <div><span className="font-bold text-[#004d38]">{lang === 'bn' ? '🗺️ বিভাগ:' : '🗺️ Division:'}</span> {selectedReport.division}</div>
              <div><span className="font-bold text-[#004d38]">{lang === 'bn' ? '📍 জেলা:' : '📍 District:'}</span> {selectedReport.district} ({selectedReport.thana || (lang === 'bn' ? 'অনির্দিষ্ট' : 'N/A')})</div>
              <div><span className="font-bold text-[#004d38]">{lang === 'bn' ? '🏢 দপ্তর/স্থান:' : '🏢 Office/Place:'}</span> {selectedReport.office}</div>
              <div><span className="font-bold text-[#004d38]">{lang === 'bn' ? '📅 তারিখ:' : '📅 Date:'}</span> {selectedReport.date}</div>
              {selectedReport.official && (
                <div className="col-span-full text-[#F42A41] font-bold flex items-center gap-1">
                  <Scale size={13} /> {lang === 'bn' ? 'অভিযুক্ত:' : 'Accused:'} {selectedReport.official} {selectedReport.officialPost ? `(${selectedReport.officialPost})` : ''}
                </div>
              )}
            </div>

            {/* Author Identity Badge */}
            <div className="flex items-center gap-2 mb-4">
              {selectedReport.author === 'নাম প্রকাশে অনিচ্ছুক' ? (
                <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-semibold">
                  <EyeOff size={12} />
                  {t.anonymousAuthor}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-blue-200">
                  <User size={12} />
                  {t.authorPrefix}{selectedReport.author}
                </div>
              )}
            </div>

            {/* Detailed Content */}
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line mb-5">
              {selectedReport.content}
            </p>

            {/* Photo Evidence Gallery */}
            {hasPhotos && (
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Image size={14} className="text-[#006A4E]" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {t.evidencePhotosTitle} ({photos.length})
                  </span>
                </div>
                <div className={`grid gap-3 ${photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => openLightbox(index)}
                      className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-gray-50"
                    >
                      <img
                        src={photo}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full transition-all">
                          {t.viewLarge}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ACC Notice Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-800 mb-6 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>⚠️ {t.accNotice}</strong> {t.accNoticeDesc}
              </div>
            </div>

            {/* Facebook Style Reaction Counts Summary */}
            <div className="flex items-center justify-between py-3 border-y border-gray-100 text-xs text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {reactions.like > 0 && <span>👍</span>}
                  {reactions.love > 0 && <span>❤️</span>}
                  {reactions.angry > 0 && <span>😡</span>}
                  {reactions.sad > 0 && <span>😢</span>}
                  {reactions.wow > 0 && <span>😮</span>}
                </div>
                <span className="font-semibold">{totalReactions} {t.reactionsCount}</span>
              </div>
              <span>{comments.length} {t.commentsCount}</span>
            </div>

            {/* Actions Bar with Facebook Style Reactions */}
            <div className="flex gap-2 relative mb-6">
              {showReactionsBar && (
                <div 
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-2xl border border-gray-200 px-3 py-1.5 flex items-center gap-2 z-30 animate-fade-in"
                  onMouseLeave={() => setShowReactionsBar(false)}
                >
                  {REACTION_CONFIG.map(r => (
                    <button
                      key={r.type}
                      type="button"
                      onClick={() => {
                        reactToReport(selectedReport.id, r.type);
                        setShowReactionsBar(false);
                      }}
                      className="transform hover:scale-130 transition-transform p-1 text-2xl cursor-pointer"
                      title={r.label}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}

              <div 
                className="flex-1 relative"
                onMouseEnter={() => setShowReactionsBar(true)}
              >
                <button
                  onClick={handleQuickReaction}
                  className={`w-full py-3 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-gray-200 bg-gray-50 hover:bg-gray-100 ${
                    currentReactionObj ? currentReactionObj.color : 'text-gray-700'
                  }`}
                >
                  {currentReactionObj ? (
                    <>
                      <span className="text-lg leading-none">{currentReactionObj.emoji}</span>
                      <span>{currentReactionObj.label}</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp size={16} />
                      <span>{t.reactBtn}</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleShare}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Share2 size={16} /> {t.shareBtn}
              </button>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                <MessageCircle size={16} className="text-[#006A4E]" />
                {lang === 'bn' ? 'মন্তব্যসমূহ' : 'Comments'} ({comments.length})
              </h3>

              {/* Comments List */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">{t.noCommentsYet}</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-gray-800">{c.author}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{c.date}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                <input
                  type="text"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  placeholder={t.yourNameOptional}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E]"
                />
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={t.writeCommentPlaceholder}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E] leading-relaxed resize-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#006A4E] hover:bg-[#004d38] text-white px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shrink-0"
                  >
                    <Send size={14} /> {t.postBtn}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 cursor-pointer"
          >
            <X size={28} />
          </button>
          <div className="absolute top-4 left-4 text-white/70 text-sm font-mono">
            {lightboxIndex + 1} / {photos.length}
          </div>
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <img
            src={photos[lightboxIndex]}
            alt={`Evidence ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default DetailModal;
