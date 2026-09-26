import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, BarChart3, Tag, Activity, Settings,
  Bell, Menu, X, ChevronRight, ChevronLeft, ArrowLeft, LogOut
} from 'lucide-react';


const navItems = [
  { path: '/dashboard',           icon: LayoutDashboard, label: 'Overview', end: true },
  { path: '/dashboard/reports',    icon: FileText,        label: 'Reports' },
  { path: '/dashboard/analytics',  icon: BarChart3,       label: 'Analytics' },
  { path: '/dashboard/categories', icon: Tag,             label: 'Categories' },
  { path: '/dashboard/activity',   icon: Activity,        label: 'Activity Feed' },
  { path: '/dashboard/settings',   icon: Settings,        label: 'Settings' },
];

export default function Dashboard() {
  const { reports, triggerToast, lang } = useReports();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      triggerToast(lang === 'bn' ? 'সফলভাবে লগআউট হয়েছেন!' : 'Logged out successfully!');
      navigate('/login');
    } catch (e) {
      console.error('Logout error', e);
    }
  };


  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'New report submitted from Dhaka', time: '2m ago', type: 'new' },
    { id: 2, text: 'Report #1042 marked verified', time: '15m ago', type: 'verified' },
    { id: 3, text: '5 reports pending review', time: '1h ago', type: 'warning' },
  ]);

  const currentPath = location.pathname;
  const currentNav = navItems.find(item => item.end ? currentPath === item.path : currentPath.startsWith(item.path)) || navItems[0];

  const pageHeaders = {
    '/dashboard':            { title: 'Dashboard Overview', sub: `${reports.length} total reports · Real-time data` },
    '/dashboard/reports':    { title: 'Reports Management', sub: `${reports.length} records available` },
    '/dashboard/analytics':  { title: 'Analytics', sub: 'Trends, distributions & insights' },
    '/dashboard/categories': { title: 'Categories', sub: 'Active departments & complaint categories' },
    '/dashboard/activity':   { title: 'Activity Feed', sub: 'Live platform events & user feedback' },
    '/dashboard/settings':   { title: 'Settings', sub: 'Platform configuration' },
  };

  const currentHeader = pageHeaders[currentNav.path] || pageHeaders['/dashboard'];

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full max-w-full overflow-x-hidden relative" style={{ background: 'linear-gradient(135deg,#0a1a12 0%,#0d2018 40%,#0a1a12 100%)' }}>

      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/75 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static flex flex-col transition-[width,transform] duration-300 ease-in-out border-r border-emerald-950/70 select-none shadow-2xl backdrop-blur-xl h-full md:min-h-screen ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${sidebarOpen ? 'md:w-64' : 'md:w-18'}`}
        style={{ background: 'linear-gradient(180deg,#020e07 0%,#04160c 100%)' }}>

        {/* Logo & Animated Toggle */}
        <div className={`h-16 flex items-center border-b border-emerald-950/80 bg-black/25 shrink-0 px-3.5 transition-all ${
          sidebarOpen ? 'justify-between' : 'md:justify-center justify-between'
        }`}>
          {/* Logo brand */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-[#FFD700] text-base shadow-lg shadow-emerald-950/80 ring-1 ring-emerald-500/30"
              style={{ background: 'linear-gradient(135deg,#006A4E,#10b981)' }}>
              সা
            </div>
            {(sidebarOpen || mobileMenuOpen) && (
              <div className="min-w-0">
                <span className="font-extrabold text-white text-sm tracking-wide block truncate">সাক্ষীবিডি (SakkhiBD)</span>
                <span className="text-[10px] text-emerald-400/80 font-mono tracking-wider block uppercase">Admin Portal</span>
              </div>
            )}
          </div>

          {/* Close for mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <X size={20} />
          </button>

          {/* Desktop Collapse Arrow Button */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="hidden md:flex text-zinc-400 hover:text-emerald-400 transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              title="সাইডবার ছোট করুন"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Desktop Expand Button when collapsed */}
        {!sidebarOpen && (
          <div className="hidden md:flex justify-center py-2.5 border-b border-emerald-950/60 bg-black/10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-400 flex items-center justify-center transition-all cursor-pointer hover:text-white shadow-xs"
              title="সাইডবার বড় করুন"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Nav Items with Child Route NavLink */}
        <nav className="flex-1 py-4 space-y-1.5 px-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-emerald-900">
          {navItems.map(({ path, icon: Icon, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `w-full flex items-center py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer group relative ${
                sidebarOpen || mobileMenuOpen ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'
              } ${
                isActive
                  ? 'text-emerald-300 font-semibold shadow-md border border-emerald-500/40 bg-gradient-to-r from-emerald-800/40 to-emerald-950/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={!sidebarOpen && !mobileMenuOpen ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  {(sidebarOpen || mobileMenuOpen) && <span className="whitespace-nowrap text-left truncate flex-1">{label}</span>}
                  {(sidebarOpen || mobileMenuOpen) && isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />}

                  {/* Floating tooltip on hover when collapsed on desktop */}
                  {!sidebarOpen && !mobileMenuOpen && (
                    <div className="hidden md:group-hover:flex absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-200 border border-emerald-700/60 text-xs font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none items-center gap-1.5 animate-fade-in">
                      <span>{label}</span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Exit link back to public site */}
        <div className="p-3 border-t border-emerald-950/80 bg-black/30 shrink-0">
          <Link
            to="/"
            className={`flex items-center py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-emerald-950/80 transition-all border border-emerald-950/60 cursor-pointer group relative ${
              sidebarOpen || mobileMenuOpen ? 'px-3 gap-2.5 justify-start' : 'px-0 justify-center'
            }`}
            title="মূল ওয়েবসাইটে ফিরে যান"
          >
            <ArrowLeft size={16} className="shrink-0 text-emerald-400 transition-transform group-hover:-translate-x-0.5" />
            {(sidebarOpen || mobileMenuOpen) && <span className="whitespace-nowrap truncate">মূল ওয়েবসাইট (Exit)</span>}

            {!sidebarOpen && !mobileMenuOpen && (
              <div className="hidden md:group-hover:flex absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-700 text-xs font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none items-center animate-fade-in">
                <span>মূল ওয়েবসাইট (Exit)</span>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-white/10 shrink-0"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            {/* Desktop Quick Toggle Button */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="hidden md:flex p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-emerald-400 hover:bg-white/10 transition-all shrink-0 cursor-pointer"
              title={sidebarOpen ? "সাইডবার লুকান (Collapse)" : "সাইডবার দেখান (Expand)"}
              aria-label="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-white truncate">{currentHeader?.title}</h1>
              <p className="text-[11px] sm:text-xs text-white/40 truncate hidden xs:block">{currentHeader?.sub}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => setShowNotifPanel(o => !o)}
                className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>
              {showNotifPanel && (
                <div className="absolute right-0 top-12 w-64 sm:w-72 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                  style={{ background: '#0d2018' }}>
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    <button onClick={() => setShowNotifPanel(false)} className="text-white/40 hover:text-white"><X size={14} /></button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'new' ? 'bg-green-400' : n.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                      <div>
                        <div className="text-xs text-white/70">{n.text}</div>
                        <div className="text-xs text-white/30 mt-0.5">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#006A4E,#F42A41)' }}>
                    {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A')}
                  </div>
                )}
                <div className="hidden sm:block text-left max-w-[120px]">
                  <div className="text-xs font-semibold text-white truncate">{currentUser?.displayName || 'Admin'}</div>
                  <div className="text-[10px] text-white/40 truncate">{currentUser?.email || 'Super User'}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title={lang === 'bn' ? 'লগআউট করুন' : 'Log out'}
              >
                <LogOut size={15} />
                <span className="hidden md:inline">{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </header>


        {/* Content Area with Nested Child Route Rendering */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}