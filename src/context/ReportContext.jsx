import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { INITIAL_REPORTS } from '../data/initialData';
import { translations } from '../data/translations';
import {
  getReportsApi,
  createReportApi,
  updateReportApi,
  deleteReportApi,
  bulkDeleteReportsApi,
  reactToReportApi,
  getAnalyticsSummaryApi,
} from '../api/reportApi';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Language state: 'bn' or 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ghush_lang') || 'bn';
  });

  const toggleLanguage = () => {
    setLang(prev => {
      const nextLang = prev === 'bn' ? 'en' : 'bn';
      localStorage.setItem('ghush_lang', nextLang);
      return nextLang;
    });
  };

  const t = translations[lang] || translations.bn;

  // Alert / Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error' | 'warning' | 'info'
  const [showToast, setShowToast] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const triggerToast = (msg, type = 'success', duration = 4000) => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  const closeToast = () => {
    setShowToast(false);
  };

  // Fetch reports from backend via React Query
  const {
    data: apiReportsData,
    isLoading: isReportsLoading,
    isFetching: isReportsFetching,
    isError: isReportsError,
    error: reportsFetchError,
    refetch: refetchReports,
    dataUpdatedAt: reportsUpdatedAt,
  } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await getReportsApi({ limit: 200 });
      return res?.data || [];
    },
    staleTime: 1000 * 15, // 15s fresh
    refetchInterval: 1000 * 20, // poll every 20s so open dashboards/pages stay live
    refetchIntervalInBackground: false, // pause polling when the tab isn't focused
    refetchOnWindowFocus: true, // instantly re-sync when the user comes back to the tab
    retry: 1,
  });

  // Fetch REAL, server-computed aggregate stats for the Transparency Ledger.
  // This runs over the ENTIRE reports collection in MongoDB (not just the
  // capped 200-record page loaded above), so KPI/registry numbers stay
  // accurate no matter how large the dataset grows. Auto-refreshes every
  // 60s so the public ledger feels live.
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
    error: analyticsFetchError,
    refetch: refetchAnalytics,
    dataUpdatedAt: analyticsUpdatedAt,
  } = useQuery({
    queryKey: ['reportsAnalyticsSummary'],
    queryFn: async () => {
      const res = await getAnalyticsSummaryApi();
      return res?.data || null;
    },
    staleTime: 1000 * 30, // 30s fresh
    refetchInterval: 1000 * 60, // background refresh every 60s
    retry: 1,
  });

  // Local storage cache fallback
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('ghush_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(r => ({
          ...r,
          id: r.id || r._id,
          reactions: r.reactions || { like: r.likes || 0, love: 0, angry: 0, sad: 0, wow: 0 },
          userReaction: r.userReaction || null,
          comments: r.comments || [],
          commentsCount: r.commentsCount ?? (r.comments || []).length,
        }));
      } catch (e) {
        console.error("Failed to parse cached reports", e);
      }
    }
    return INITIAL_REPORTS.map(r => ({
      ...r,
      reactions: { like: r.likes || 12, love: Math.floor((r.likes || 10) / 4), angry: Math.floor((r.likes || 10) / 3), sad: 2, wow: 1 },
      userReaction: null,
      comments: [
        {
          id: 1,
          author: 'সচেতন নাগরিক',
          text: 'এই অন্যায়ের বিরুদ্ধে কঠোর ব্যবস্থা নেওয়া দরকার! সবাই এগিয়ে আসুন।',
          date: '২ দিন আগে'
        }
      ]
    }));
  });

  // Synchronize state when backend reports arrive
  useEffect(() => {
    if (apiReportsData && Array.isArray(apiReportsData) && apiReportsData.length > 0) {
      const normalized = apiReportsData.map(r => ({
        ...r,
        id: r.id || r._id,
        reactions: r.reactions || { like: r.likes || 0, love: 0, angry: 0, sad: 0, wow: 0 },
        userReaction: r.userReaction || null,
        comments: r.comments || [],
        commentsCount: r.commentsCount ?? (r.comments || []).length,
        photos: r.proofImages || r.photos || [],
      }));
      setReports(normalized);
      localStorage.setItem('ghush_reports', JSON.stringify(normalized));
    }
  }, [apiReportsData]);

  // Keep local storage synchronized
  useEffect(() => {
    if (reports && reports.length > 0) {
      localStorage.setItem('ghush_reports', JSON.stringify(reports));
    }
  }, [reports]);

  // Keep selectedReport up to date
  useEffect(() => {
    if (selectedReport) {
      const updated = reports.find(r => (r.id === selectedReport.id || r._id === selectedReport._id));
      if (updated) {
        setSelectedReport(updated);
      }
    }
  }, [reports]);

  // React Query Mutation: Create Report
  const createReportMutation = useMutation({
    mutationFn: (newReport) => {
      const payload = {
        ...newReport,
        proofImages: newReport.photos || [],
      };
      return createReportApi(payload);
    },
    onSuccess: (response) => {
      const savedReport = response?.data;
      const formatted = {
        ...savedReport,
        id: savedReport?.id || savedReport?._id || Date.now(),
        photos: savedReport?.proofImages || [],
        userReaction: 'like',
      };
      setReports(prev => [formatted, ...prev.filter(p => p.id !== formatted.id)]);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsAnalyticsSummary'] });
      triggerToast(
        lang === 'bn' ? 'অভিযোগ সফলভাবে লেজারে যুক্ত হয়েছে!' : 'Complaint added to ledger successfully!',
        'success'
      );
    },
    onError: (err) => {
      console.error('Failed to create report on backend:', err);
      // Fallback: save to local state so user does not lose data
      triggerToast(
        lang === 'bn' 
          ? `অভিযোগ সার্ভারে জমা দেওয়া যায়নি: ${err.message || 'নেটওয়ার্ক সমস্যা'}।` 
          : `Failed to submit to server: ${err.message || 'Network error'}`,
        'error'
      );
    }
  });

  // React Query Mutation: Update Report
  const updateReportMutation = useMutation({
    mutationFn: ({ id, updatedFields }) => updateReportApi(id, updatedFields),
    onSuccess: (response, variables) => {
      const updatedData = response?.data || variables.updatedFields;
      setReports(prev => prev.map(r => (r.id === variables.id || r._id === variables.id) ? { ...r, ...updatedData } : r));
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsAnalyticsSummary'] });
      triggerToast(lang === 'bn' ? 'রিপোর্ট আপডেট করা হয়েছে!' : 'Report updated!', 'success');
    },
    onError: (err, variables) => {
      console.error('Failed to update report on backend:', err);
      // Fallback local update
      setReports(prev => prev.map(r => (r.id === variables.id || r._id === variables.id) ? { ...r, ...variables.updatedFields } : r));
      triggerToast(
        lang === 'bn' ? 'সার্ভার ত্রুটি: লোকাল তথ্য আপডেট হয়েছে।' : 'Server error: Local data updated.',
        'warning'
      );
    }
  });

  // React Query Mutation: Delete Single Report
  const deleteReportMutation = useMutation({
    mutationFn: (id) => deleteReportApi(id),
    onSuccess: (_, id) => {
      setReports(prev => prev.filter(r => r.id !== id && r._id !== id));
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsAnalyticsSummary'] });
      triggerToast(lang === 'bn' ? 'রিপোর্ট মুছে ফেলা হয়েছে!' : 'Report deleted!', 'success');
    },
    onError: (err, id) => {
      console.error('Failed to delete report on backend:', err);
      // Local removal fallback
      setReports(prev => prev.filter(r => r.id !== id && r._id !== id));
      triggerToast(
        lang === 'bn' ? 'সার্ভার সমস্যা, তবে তালিকা থেকে মুছে দেওয়া হয়েছে।' : 'Server error, deleted locally.',
        'warning'
      );
    }
  });

  // React Query Mutation: Bulk Delete Reports
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => bulkDeleteReportsApi(ids),
    onSuccess: (_, ids) => {
      setReports(prev => prev.filter(r => !ids.includes(r.id) && !ids.includes(r._id)));
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsAnalyticsSummary'] });
      triggerToast(
        lang === 'bn' ? `${ids.length} টি রিপোর্ট মুছে ফেলা হয়েছে!` : `${ids.length} reports deleted!`,
        'success'
      );
    },
    onError: (err, ids) => {
      console.error('Failed to bulk delete reports on backend:', err);
      setReports(prev => prev.filter(r => !ids.includes(r.id) && !ids.includes(r._id)));
      triggerToast(
        lang === 'bn' ? 'সার্ভার সমস্যা, তবে লোকাল তালিকা থেকে মুছে দেওয়া হয়েছে।' : 'Server error, deleted locally.',
        'warning'
      );
    }
  });

  // Add report handler
  const addReport = async (newReport) => {
    try {
      return await createReportMutation.mutateAsync(newReport);
    } catch {
      // Handled in onError
    }
  };

  // Update report handler
  const updateReport = (id, updatedFields) => {
    updateReportMutation.mutate({ id, updatedFields });
  };

  // Delete single report handler
  const deleteReport = (id) => {
    deleteReportMutation.mutate(id);
  };

  // Delete multiple reports handler
  const deleteMultipleReports = (ids) => {
    bulkDeleteMutation.mutate(ids);
  };

  // React to report handler
  const reactToReport = async (reportId, reactionType) => {
    const target = reports.find(r => r.id === reportId || r._id === reportId);
    const previousReaction = target?.userReaction;
    // পুরানো reactions snapshot রাখি rollback-এর জন্য
    const previousReactions = target ? { ...(target.reactions || {}) } : null;

    // ---- Optimistic UI update ----
    const applyOptimisticUpdate = (isToggleOff) => {
      setReports(prev => prev.map(report => {
        if (report.id !== reportId && report._id !== reportId) return report;
        const currentReactions = { ...(report.reactions || { like: 0, love: 0, angry: 0, sad: 0, wow: 0 }) };

        if (isToggleOff) {
          currentReactions[reactionType] = Math.max(0, (currentReactions[reactionType] || 1) - 1);
          const total = Object.values(currentReactions).reduce((a, b) => a + b, 0);
          return { ...report, reactions: currentReactions, userReaction: null, likes: total };
        }

        if (previousReaction && currentReactions[previousReaction] !== undefined) {
          currentReactions[previousReaction] = Math.max(0, currentReactions[previousReaction] - 1);
        }
        currentReactions[reactionType] = (currentReactions[reactionType] || 0) + 1;
        const total = Object.values(currentReactions).reduce((a, b) => a + b, 0);
        return { ...report, reactions: currentReactions, userReaction: reactionType, likes: total };
      }));
    };

    const isToggleOff = previousReaction === reactionType;
    applyOptimisticUpdate(isToggleOff);

    // ---- Backend sync ----
    try {
      if (typeof reportId === 'string' && reportId.length === 24) {
        const res = await reactToReportApi(reportId, { reactionType });
        // Backend response দিয়ে accurate state সেট করি
        const serverData = res?.data || res;
        if (serverData?.reactions !== undefined) {
          setReports(prev => prev.map(report => {
            if (report.id !== reportId && report._id !== reportId) return report;
            return {
              ...report,
              reactions: serverData.reactions,
              userReaction: serverData.userReaction !== undefined ? serverData.userReaction : report.userReaction,
              likes: serverData.likes ?? report.likes,
            };
          }));
        }
      }
    } catch (err) {
      console.warn('Backend react call failed, rolling back:', err);
      // Rollback to previous state
      setReports(prev => prev.map(report => {
        if (report.id !== reportId && report._id !== reportId) return report;
        return {
          ...report,
          reactions: previousReactions || report.reactions,
          userReaction: previousReaction,
          likes: previousReactions ? Object.values(previousReactions).reduce((a, b) => a + b, 0) : report.likes,
        };
      }));
    }
  };

  const likeReport = (id) => {
    reactToReport(id, 'like');
    triggerToast(lang === 'bn' ? 'আপনার সমর্থন গৃহীত হয়েছে!' : 'Support received!', 'success');
  };

  const exportToCSV = () => {
    const headers = ["ID", "Title", "Amount", "Outcome", "Division", "District", "Thana", "Category", "Office", "Official", "Date", "Likes"];
    const rows = reports.map(b => [
      b.id || b._id,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      b.amount || 0,
      `"${b.outcome || ''}"`,
      `"${b.division || ''}"`,
      `"${b.district || ''}"`,
      `"${b.thana || ''}"`,
      `"${b.category || ''}"`,
      `"${(b.office || '').replace(/"/g, '""')}"`,
      `"${(b.official || '').replace(/"/g, '""')}"`,
      `"${b.date || ''}"`,
      b.likes || 0
    ]);

    const csv = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const uri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    link.setAttribute("download", `ghush_ledger_bangladesh_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(lang === 'bn' ? 'CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!' : 'CSV file downloaded successfully!', 'info');
  };

  return (
    <ReportContext.Provider value={{
      reports,
      lang,
      setLang,
      toggleLanguage,
      t,
      addReport,
      updateReport,
      deleteReport,
      deleteMultipleReports,
      likeReport,
      reactToReport,
      exportToCSV,
      triggerToast,
      closeToast,
      toastMessage,
      toastType,
      showToast,
      selectedReport,
      setSelectedReport,
      isSubmitModalOpen,
      setIsSubmitModalOpen,
      isReportsLoading,
      isReportsFetching,
      isReportsError,
      reportsFetchError,
      reportsUpdatedAt,
      refetchReports,
      createReportMutation,
      analyticsData,
      isAnalyticsLoading,
      isAnalyticsError,
      analyticsFetchError,
      analyticsUpdatedAt,
      refetchAnalytics,
    }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => useContext(ReportContext);

