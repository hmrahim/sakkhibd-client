import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReportProvider } from './context/ReportContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import SubmitModal from './components/SubmitModal';
import DetailModal from './components/DetailModal';
import Toast from './components/Toast';

import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Ledger from './pages/Ledger';
import Analytics from './pages/Analytics';
import Hierarchy from './pages/Hierarchy';
import About from './pages/About';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import DashboardReports from './pages/dashboard/DashboardReports';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';
import DashboardCategories from './pages/dashboard/DashboardCategories';
import DashboardActivity from './pages/dashboard/DashboardActivity';
import DashboardComments from './pages/dashboard/DashboardComments';
import DashboardSettings from './pages/dashboard/DashboardSettings';

function MainContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthPage = location.pathname === '/login';
  const hideChrome = isDashboard || isAuthPage;

  return (
    <div className={`flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden ${hideChrome ? 'bg-[#0a1a12]' : 'bg-[#f8fafc]'}`}>
      {!hideChrome && <Navbar />}
      <main className={`flex-1 w-full max-w-full overflow-x-hidden ${!hideChrome ? 'mobile-app-content' : ''}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/blogs' element={<Blogs />} />
          <Route path='/articles' element={<Articles />} />
          <Route path='/articles/:id' element={<ArticleDetail />} />
          <Route path='/ledger' element={<Ledger />} />
          <Route path='/analytics' element={<Analytics />} />
          <Route path='/hierarchy' element={<Hierarchy />} />
          <Route path='/about' element={<About />} />
          <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
          <Route path='/unauthorized' element={<Unauthorized />} />

          {/* Protected Dashboard Route & Nested Child Routes */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path='reports' element={<DashboardReports />} />
            <Route path='analytics' element={<DashboardAnalytics />} />
            <Route path='categories' element={<DashboardCategories />} />
            <Route path='activity' element={<DashboardActivity />} />
            <Route path='comments' element={<DashboardComments />} />
            <Route path='settings' element={<DashboardSettings />} />
          </Route>
        </Routes>
      </main>
      {!hideChrome && <Footer />}
      {!hideChrome && <MobileBottomNav />}
      {!hideChrome && <SubmitModal />}
      {!hideChrome && <DetailModal />}
      <Toast />
    </div>
  );
}



// React Query global client — production-optimized config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime: 1000 * 60 * 10,     // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ReportProvider>
          <BrowserRouter>
            <MainContent />
          </BrowserRouter>
        </ReportProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;