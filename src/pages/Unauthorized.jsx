import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#040e09] flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 items-center justify-center mx-auto">
          <ShieldOff size={36} className="text-rose-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white mb-2">অ্যাক্সেস নিষিদ্ধ</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            এই পেজে প্রবেশের অনুমতি নেই। শুধুমাত্র <span className="text-emerald-400 font-semibold">Admin</span> রোলের ব্যবহারকারীরা ড্যাশবোর্ড ব্যবহার করতে পারবেন।
          </p>
        </div>
        {currentUser && (
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-700/50 text-sm text-left space-y-1">
            <p className="text-zinc-400 text-xs">লগইন করা অ্যাকাউন্ট:</p>
            <p className="text-white font-semibold">{currentUser.displayName || currentUser.email}</p>
            <p className="text-zinc-500 text-xs">{currentUser.email}</p>
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">ডাটাবেসে বর্তমান রোল:</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${userRole === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {userRole || 'লোডিং অথবা পাওয়া যায়নি (Sync Error)'}
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-sm font-semibold transition-all"
          >
            <Home size={16} />
            হোম পেজে যান
          </Link>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              লগআউট করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
}