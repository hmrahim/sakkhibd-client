import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportContext';
import {
  getCommentsApi,
  addCommentApi,
  addReplyApi,
  updateCommentApi,
  updateReplyApi,
  toggleLikeCommentApi,
  toggleLikeReplyApi,
  deleteCommentApi,
  deleteReplyApi,
} from '../api/commentApi';
import {
  Send,
  ThumbsUp,
  Trash2,
  Pencil,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  UserCircle2,
  Loader2,
  X,
  Check,
} from 'lucide-react';

const Avatar = ({ name, photo, size = 28 }) => {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-[#e8f5f0] text-[#006A4E] flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <UserCircle2 size={size * 0.75} />
    </div>
  );
};

/**
 * একটা কমেন্ট বা রিপ্লাই কার্ড — like/reply/edit/delete সব একই কম্পোনেন্ট দিয়ে হ্যান্ডল হয়।
 */
const CommentItem = ({
  item,
  t,
  lang,
  isReply,
  onToggleLike,
  onReply,
  onStartEdit,
  onDelete,
  isEditing,
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
  savingEdit,
  togglingLike,
  children,
}) => {
  return (
    <div className="flex gap-2.5">
      <Avatar name={item.author} photo={item.authorPhoto} size={isReply ? 24 : 30} />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl px-3 py-2 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-bold text-xs text-gray-800 truncate">{item.author}</span>
            <span className="text-[10px] text-gray-400 font-mono shrink-0">{item.date}</span>
          </div>

          {isEditing ? (
            <div className="space-y-1.5 mt-1">
              <textarea
                rows={2}
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={2000}
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#006A4E] resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={onSaveEdit}
                  className="text-[11px] font-bold text-white bg-[#006A4E] hover:bg-[#004d38] px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  {savingEdit ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {t.saveBtn}
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="text-[11px] font-bold text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <X size={12} /> {t.cancelBtn}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              {item.text}{' '}
              {item.isEdited && <span className="text-[10px] text-gray-400">{t.editedTag}</span>}
            </p>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-3 mt-1 pl-1">
            <button
              type="button"
              onClick={onToggleLike}
              disabled={togglingLike}
              className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                item.isLiked ? 'text-[#006A4E]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ThumbsUp size={12} className={item.isLiked ? 'fill-current' : ''} />
              {item.likesCount > 0 ? item.likesCount : ''} {t.like}
            </button>

            {!isReply && onReply && (
              <button
                type="button"
                onClick={onReply}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
              >
                <CornerDownRight size={12} /> {t.replyBtn}
              </button>
            )}

            {(item.isOwner || item.canModerate) && (
              <>
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                >
                  <Pencil size={11} /> {t.editBtn}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-[11px] font-semibold text-red-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} /> {t.deleteBtn}
                </button>
              </>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

const CommentSection = ({ reportId }) => {
  const { t, lang, triggerToast } = useReports();
  const { currentUser, dbUser, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [anonName, setAnonName] = useState('');
  const [replyOpenFor, setReplyOpenFor] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [editing, setEditing] = useState(null); // { commentId, replyId | null }
  const [editText, setEditText] = useState('');

  const queryKey = ['comments', reportId];

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => getCommentsApi(reportId, { page: pageParam, limit: 10 }),
    initialPageParam: 1, // React Query v5 requires this — without it the query throws and nothing renders
    getNextPageParam: (lastPage) => (lastPage?.page < lastPage?.pages ? lastPage.page + 1 : undefined),
    enabled: !!reportId,
    staleTime: 1000 * 10,
  });

  if (isError) {
    // ডেভেলপমেন্টে দ্রুত ডিবাগ করার জন্য — production এ noisy console log এড়াতে চাইলে এটা সরিয়ে দিতে পারেন
    console.error('[CommentSection] Failed to load comments:', queryError);
  }

  const comments = (data?.pages || []).flatMap((p) => p?.data || []);
  const totalComments = data?.pages?.[0]?.total ?? comments.length;

  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  const bumpReportsCount = () => queryClient.invalidateQueries({ queryKey: ['reports'] });

  const onErr = () => triggerToast(t.commentActionFailed, 'error');

  const addCommentMutation = useMutation({
    mutationFn: (payload) => addCommentApi(reportId, payload),
    onSuccess: () => {
      setCommentText('');
      invalidate();
      bumpReportsCount();
      triggerToast(t.commentPostedSuccess, 'success');
    },
    onError: onErr,
  });

  const addReplyMutation = useMutation({
    mutationFn: ({ commentId, payload }) => addReplyApi(commentId, payload),
    onSuccess: () => {
      setReplyText('');
      setReplyOpenFor(null);
      invalidate();
      bumpReportsCount();
      triggerToast(t.replyPostedSuccess, 'success');
    },
    onError: onErr,
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId) => toggleLikeCommentApi(commentId),
    onSuccess: invalidate,
    onError: onErr,
  });

  const likeReplyMutation = useMutation({
    mutationFn: ({ commentId, replyId }) => toggleLikeReplyApi(commentId, replyId),
    onSuccess: invalidate,
    onError: onErr,
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, text }) => updateCommentApi(commentId, { text }),
    onSuccess: () => {
      setEditing(null);
      invalidate();
      triggerToast(t.commentUpdatedSuccess, 'success');
    },
    onError: onErr,
  });

  const updateReplyMutation = useMutation({
    mutationFn: ({ commentId, replyId, text }) => updateReplyApi(commentId, replyId, { text }),
    onSuccess: () => {
      setEditing(null);
      invalidate();
      triggerToast(t.commentUpdatedSuccess, 'success');
    },
    onError: onErr,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteCommentApi(commentId),
    onSuccess: () => {
      invalidate();
      bumpReportsCount();
      triggerToast(t.commentDeletedSuccess, 'success');
    },
    onError: onErr,
  });

  const deleteReplyMutation = useMutation({
    mutationFn: ({ commentId, replyId }) => deleteReplyApi(commentId, replyId),
    onSuccess: () => {
      invalidate();
      bumpReportsCount();
      triggerToast(t.commentDeletedSuccess, 'success');
    },
    onError: onErr,
  });

  const displayName = dbUser?.displayName || currentUser?.displayName || '';
  const displayPhoto = dbUser?.photoURL || currentUser?.photoURL || '';

  const buildPayload = (text) => {
    const payload = { text };
    if (!currentUser && anonName.trim()) payload.author = anonName.trim();
    return payload;
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    addCommentMutation.mutate(buildPayload(text));
  };

  const handleSubmitReply = (commentId) => (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    addReplyMutation.mutate({ commentId, payload: buildPayload(text) });
  };

  const startEditComment = (comment) => {
    setEditing({ commentId: comment.id, replyId: null });
    setEditText(comment.text);
  };
  const startEditReply = (commentId, reply) => {
    setEditing({ commentId, replyId: reply.id });
    setEditText(reply.text);
  };
  const cancelEdit = () => {
    setEditing(null);
    setEditText('');
  };
  const saveEdit = () => {
    const text = editText.trim();
    if (!text) return;
    if (editing.replyId) {
      updateReplyMutation.mutate({ commentId: editing.commentId, replyId: editing.replyId, text });
    } else {
      updateCommentMutation.mutate({ commentId: editing.commentId, text });
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm(t.confirmDeleteComment)) {
      deleteCommentMutation.mutate(commentId);
    }
  };
  const handleDeleteReply = (commentId, replyId) => {
    if (window.confirm(t.confirmDeleteReply)) {
      deleteReplyMutation.mutate({ commentId, replyId });
    }
  };

  const toggleExpandReplies = (commentId) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <div>
      <h3 className="font-bold text-gray-800 text-sm mb-3">
        {lang === 'bn' ? 'মন্তব্যসমূহ' : 'Comments'} ({totalComments})
      </h3>

      {/* Comments List */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-xs text-gray-400 text-center py-4 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> {t.loadingComments}
          </p>
        ) : isError ? (
          <p className="text-xs text-red-400 text-center py-3">{t.commentActionFailed}</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">{t.noCommentsYet}</p>
        ) : (
          comments.map((comment) => {
            const showReplies = expandedReplies[comment.id] ?? comment.repliesCount <= 2;
            return (
              <CommentItem
                key={comment.id}
                item={comment}
                t={t}
                lang={lang}
                isReply={false}
                togglingLike={likeCommentMutation.isPending && likeCommentMutation.variables === comment.id}
                onToggleLike={() => likeCommentMutation.mutate(comment.id)}
                onReply={() => setReplyOpenFor(replyOpenFor === comment.id ? null : comment.id)}
                onStartEdit={() => startEditComment(comment)}
                onDelete={() => handleDeleteComment(comment.id)}
                isEditing={editing?.commentId === comment.id && !editing?.replyId}
                editText={editText}
                setEditText={setEditText}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                savingEdit={updateCommentMutation.isPending}
              >
                {/* Reply form */}
                {replyOpenFor === comment.id && (
                  <form onSubmit={handleSubmitReply(comment.id)} className="flex gap-2 mt-2 pl-1">
                    <input
                      type="text"
                      autoFocus
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t.writeReplyPlaceholder}
                      maxLength={2000}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#006A4E]"
                    />
                    <button
                      type="submit"
                      disabled={addReplyMutation.isPending}
                      className="bg-[#006A4E] hover:bg-[#004d38] text-white px-3 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60 shrink-0"
                    >
                      {addReplyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    </button>
                  </form>
                )}

                {/* Replies toggle + list */}
                {comment.repliesCount > 0 && (
                  <div className="mt-2 pl-1">
                    {!showReplies ? (
                      <button
                        type="button"
                        onClick={() => toggleExpandReplies(comment.id)}
                        className="text-[11px] font-bold text-[#006A4E] flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronDown size={12} /> {comment.repliesCount} {t.repliesCount}
                      </button>
                    ) : (
                      <>
                        {comment.repliesCount > 2 && (
                          <button
                            type="button"
                            onClick={() => toggleExpandReplies(comment.id)}
                            className="text-[11px] font-bold text-gray-400 flex items-center gap-1 mb-2 cursor-pointer"
                          >
                            <ChevronUp size={12} /> {t.hideReplies}
                          </button>
                        )}
                        <div className="space-y-2.5 border-l-2 border-gray-100 pl-3">
                          {comment.replies.map((reply) => (
                            <CommentItem
                              key={reply.id}
                              item={reply}
                              t={t}
                              lang={lang}
                              isReply
                              togglingLike={
                                likeReplyMutation.isPending &&
                                likeReplyMutation.variables?.replyId === reply.id
                              }
                              onToggleLike={() =>
                                likeReplyMutation.mutate({ commentId: comment.id, replyId: reply.id })
                              }
                              onStartEdit={() => startEditReply(comment.id, reply)}
                              onDelete={() => handleDeleteReply(comment.id, reply.id)}
                              isEditing={editing?.commentId === comment.id && editing?.replyId === reply.id}
                              editText={editText}
                              setEditText={setEditText}
                              onSaveEdit={saveEdit}
                              onCancelEdit={cancelEdit}
                              savingEdit={updateReplyMutation.isPending}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CommentItem>
            );
          })
        )}

        {hasNextPage && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full text-center text-xs font-bold text-[#006A4E] hover:underline py-2 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isFetchingNextPage ? <Loader2 size={13} className="animate-spin" /> : null}
            {t.loadMoreComments}
          </button>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-2 border-t border-gray-200 pt-3">
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <Avatar name={displayName || 'A'} photo={displayPhoto} size={20} />
          {currentUser ? (
            <span>
              {lang === 'bn' ? 'পোস্ট করছেন ' : 'Posting as '}
              <span className="font-bold text-gray-700">{displayName}</span>
            </span>
          ) : (
            <span>{t.loginToComment}</span>
          )}
        </div>

        {!currentUser && (
          <input
            type="text"
            value={anonName}
            onChange={(e) => setAnonName(e.target.value)}
            placeholder={t.yourNameOptional}
            maxLength={100}
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E]"
          />
        )}

        <div className="flex gap-2">
          <textarea
            rows={2}
            required
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t.writeCommentPlaceholder}
            maxLength={2000}
            className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#006A4E] leading-relaxed resize-none"
          />
          <button
            type="submit"
            disabled={addCommentMutation.isPending}
            className="bg-[#006A4E] hover:bg-[#004d38] text-white px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shrink-0 disabled:opacity-60"
          >
            {addCommentMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {t.postBtn}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
