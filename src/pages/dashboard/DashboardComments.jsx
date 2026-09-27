import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  MessageSquare, Search, Trash2, EyeOff, Eye, ChevronDown, ChevronUp,
  ThumbsUp, Loader2, ShieldCheck, UserCircle2, FileText,
  ChevronLeft, ChevronRight as ChevronRightIcon, MapPin, AlertTriangle,
} from 'lucide-react';
import { useReports } from '../../context/ReportContext';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import {
  getAdminReportsWithCommentsApi,
  getReportCommentsAdminApi,
  moderateCommentApi,
  moderateReplyApi,
  deleteCommentApi,
  deleteReplyApi,
} from '../../api/commentApi';
import { OverviewStrip, Pill } from './DashboardCommon';

const PER_PAGE = 10;

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const AuthorTag = ({ authorType }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
      authorType === 'user'
        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
        : 'bg-white/5 text-white/40 border border-white/10'
    }`}
  >
    {authorType === 'user' ? <ShieldCheck size={10} /> : <UserCircle2 size={10} />}
    {authorType === 'user' ? 'Verified' : 'Anonymous'}
  </span>
);

const StatusPill = ({ status }) =>
  status === 'hidden' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/25">
      <EyeOff size={10} /> Hidden
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-300 border border-green-500/25">
      <Eye size={10} /> Visible
    </span>
  );

// একটা single comment/reply রো — hide/unhide + delete বাটন সহ (comment ও reply দুটোতেই reuse হয়)
const ThreadRow = ({ item, isReply, onToggleHide, onDelete, hidePending, deletePending }) => (
  <div className="flex items-start justify-between gap-3 flex-wrap">
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className={`font-bold text-white ${isReply ? 'text-xs' : 'text-sm'}`}>{item.author}</span>
        <AuthorTag authorType={item.authorType} />
        <StatusPill status={item.status} />
        <span className="text-[10px] text-white/30 font-mono">{item.date}</span>
      </div>
      <p className={`text-white/75 leading-relaxed whitespace-pre-line ${isReply ? 'text-xs' : 'text-sm'}`}>
        {item.text}
        {item.isEdited && <span className="text-[10px] text-white/30"> (edited)</span>}
      </p>
      <div className="flex items-center gap-1 mt-1 text-[10px] text-white/40">
        <ThumbsUp size={10} /> {item.likesCount}
      </div>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={onToggleHide}
        disabled={hidePending}
        title={item.status === 'hidden' ? 'Restore (make visible)' : 'Hide from public'}
        className={`p-1.5 rounded-lg border cursor-pointer transition-colors disabled:opacity-50 ${
          item.status === 'hidden'
            ? 'bg-green-500/10 border-green-500/25 text-green-300 hover:bg-green-500/20'
            : 'bg-white/5 border-white/10 text-white/50 hover:text-yellow-300 hover:border-yellow-500/30'
        }`}
      >
        {item.status === 'hidden' ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deletePending}
        title={isReply ? 'Delete reply' : 'Delete comment (and its replies)'}
        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 hover:bg-red-500/20 cursor-pointer transition-colors disabled:opacity-50"
      >
        <Trash2 size={13} />
      </button>
    </div>
  </div>
);

// Expand করলে একটা রিপোর্টের পুরো কমেন্ট + রিপ্লাই থ্রেড lazy-load হয়ে এখানে রেন্ডার হয়
const ReportThread = ({ reportId, onErr }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-report-comments', reportId],
    queryFn: () => getReportCommentsAdminApi(reportId),
  });

  const comments = data?.data || [];

  const invalidateThread = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-report-comments', reportId] });
    queryClient.invalidateQueries({ queryKey: ['admin-comment-reports'] });
  };
  const bumpReports = () => queryClient.invalidateQueries({ queryKey: ['reports'] });

  const moderateCommentMut = useMutation({
    mutationFn: ({ commentId, status }) => moderateCommentApi(commentId, status),
    onSuccess: invalidateThread,
    onError: onErr,
  });
  const moderateReplyMut = useMutation({
    mutationFn: ({ commentId, replyId, status }) => moderateReplyApi(commentId, replyId, status),
    onSuccess: invalidateThread,
    onError: onErr,
  });
  const deleteCommentMut = useMutation({
    mutationFn: (commentId) => deleteCommentApi(commentId),
    onSuccess: () => { invalidateThread(); bumpReports(); },
    onError: onErr,
  });
  const deleteReplyMut = useMutation({
    mutationFn: ({ commentId, replyId }) => deleteReplyApi(commentId, replyId),
    onSuccess: () => { invalidateThread(); bumpReports(); },
    onError: onErr,
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center text-white/40 text-xs flex items-center justify-center gap-2">
        <Loader2 size={14} className="animate-spin" /> Loading comments...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-6 text-center text-red-300 text-xs">
        Failed to load this report's comments.
        {error?.message && <div className="mt-1 text-red-300/60 font-mono text-[10px]">{error.message}</div>}
      </div>
    );
  }
  if (comments.length === 0) {
    return <div className="p-6 text-center text-white/40 text-xs">No comments on this report yet.</div>;
  }

  return (
    <div className="divide-y divide-white/5">
      {comments.map((comment) => (
        <div key={comment.id} className="p-4 sm:p-5">
          <ThreadRow
            item={comment}
            onToggleHide={() =>
              moderateCommentMut.mutate({
                commentId: comment.id,
                status: comment.status === 'hidden' ? 'approved' : 'hidden',
              })
            }
            onDelete={() => {
              if (
                window.confirm(
                  `Delete this comment${comment.repliesCount ? ` and its ${comment.repliesCount} repl${comment.repliesCount > 1 ? 'ies' : 'y'}` : ''}? This cannot be undone.`
                )
              ) {
                deleteCommentMut.mutate(comment.id);
              }
            }}
            hidePending={moderateCommentMut.isPending}
            deletePending={deleteCommentMut.isPending}
          />

          {comment.repliesCount > 0 && (
            <div className="mt-3 ml-4 pl-3 border-l-2 border-white/10 space-y-3">
              {comment.replies.map((reply) => (
                <ThreadRow
                  key={reply.id}
                  item={reply}
                  isReply
                  onToggleHide={() =>
                    moderateReplyMut.mutate({
                      commentId: comment.id,
                      replyId: reply.id,
                      status: reply.status === 'hidden' ? 'approved' : 'hidden',
                    })
                  }
                  onDelete={() => {
                    if (window.confirm('Delete this reply? This cannot be undone.')) {
                      deleteReplyMut.mutate({ commentId: comment.id, replyId: reply.id });
                    }
                  }}
                  hidePending={moderateReplyMut.isPending}
                  deletePending={deleteReplyMut.isPending}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function DashboardComments() {
  const { triggerToast } = useReports();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [statusFilter, setStatusFilter] = useState('all'); // all | approved | hidden
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});

  const onErr = () => triggerToast('Action failed, please try again.', 'error');

  const queryKey = ['admin-comment-reports', page, debouncedSearch, statusFilter];

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      getAdminReportsWithCommentsApi({
        page,
        limit: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    keepPreviousData: true,
  });

  const reports = data?.data || [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // Auto-expand reports so all comments are immediately visible
  React.useEffect(() => {
    if (reports.length > 0) {
      setExpanded((prev) => {
        const next = { ...prev };
        reports.forEach((r) => {
          if (next[r.id] === undefined) {
            next[r.id] = true;
          }
        });
        return next;
      });
    }
  }, [reports]);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const overviewItems = [
    { icon: FileText, label: 'Reports with comments', value: total, color: '#3b82f6' },
    { icon: MessageSquare, label: 'Comments + replies (this page)', value: reports.reduce((s, r) => s + r.totalCount, 0), color: '#8b5cf6' },
    { icon: EyeOff, label: 'Hidden items (this page)', value: reports.reduce((s, r) => s + r.hiddenCount, 0), color: '#ef4444' },
    { icon: AlertTriangle, label: 'Needs attention (this page)', value: reports.filter((r) => r.hiddenCount > 0).length, color: '#f59e0b' },
  ];

  return (
    <div>
      <OverviewStrip items={overviewItems} />

      {/* Search + Filters + Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by report title, office or district..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Pill active={statusFilter === 'all'} onClick={() => { setStatusFilter('all'); setPage(1); }}>All</Pill>
          <Pill active={statusFilter === 'approved'} onClick={() => { setStatusFilter('approved'); setPage(1); }} color="#22c55e">Has visible</Pill>
          <Pill active={statusFilter === 'hidden'} onClick={() => { setStatusFilter('hidden'); setPage(1); }} color="#ef4444">Has hidden</Pill>
          
          <button
            type="button"
            onClick={() => {
              if (Object.values(expanded).some(Boolean)) {
                setExpanded({});
              } else {
                const allOpen = {};
                reports.forEach((r) => { allOpen[r.id] = true; });
                setExpanded(allOpen);
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            {Object.values(expanded).some(Boolean) ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      {/* Reports list — each expands into its own comment thread */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {isLoading ? (
          <div className="p-10 text-center text-white/40 text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading reports...
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-red-300 text-sm">
            Failed to load comments.
            {error?.message && <div className="mt-1 text-red-300/60 font-mono text-xs">{error.message}</div>}
          </div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center text-white/40 text-sm">No reports with comments found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((report) => (
              <div key={report.id}>
                <button
                  type="button"
                  onClick={() => toggleExpand(report.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer hover:bg-white/[0.03] transition-colors"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                      <FileText size={16} className="text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm truncate max-w-[260px] sm:max-w-lg">{report.title}</span>
                        {report.hiddenCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/25">
                            <EyeOff size={9} /> {report.hiddenCount} hidden
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-1 text-[11px] text-white/40">
                        {report.district && (
                          <span className="inline-flex items-center gap-1"><MapPin size={10} />{report.district}</span>
                        )}
                        {report.category && <span>· {report.category}</span>}
                        <span>· Last activity {timeAgo(report.lastActivityAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-xs font-semibold text-white/60">
                      <MessageSquare size={13} /> {report.totalCount}
                    </span>
                    {expanded[report.id] ? (
                      <ChevronUp size={16} className="text-white/40" />
                    ) : (
                      <ChevronDown size={16} className="text-white/40" />
                    )}
                  </div>
                </button>

                {expanded[report.id] && (
                  <div className="border-t border-white/5 bg-black/10">
                    <ReportThread reportId={report.id} onErr={onErr} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-white/50">
          <span>Page {page} of {pages} · {total} reports with comments</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages || isFetching}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}