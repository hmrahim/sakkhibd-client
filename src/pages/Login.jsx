import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportContext';
import {
  ShieldCheck, Lock, Mail, User, Eye, EyeOff,
  ArrowRight, CheckCircle2, AlertCircle, ArrowLeft,
  KeyRound, Shield, Scale, FileText, BarChart2
} from 'lucide-react';

// ─── Reusable Field Components ────────────────────────────────────────────────
function FormField({ label, error, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-300 mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />}
        {children}
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function Alert({ type, message }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`mb-4 p-3 rounded-2xl flex items-start gap-2.5 text-xs ${
      isError
        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
    }`}>
      {isError
        ? <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
        : <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />}
      <span className="leading-snug">{message}</span>
    </div>
  );
}

// ─── Main Login Component ──────────────────────────────────────────────────────
export default function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
    syncAndFetchRole,
  } = useAuth();
  const { triggerToast, lang } = useReports();
  const navigate = useNavigate();
  const location = useLocation();

  // ─── React Hook Form setup ─────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const passwordValue = watch('password');

  // ─── Tab Switcher ──────────────────────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    reset();
  };

  // ─── Firebase Error Format ─────────────────────────────────────────────────
  const formatFirebaseError = (err) => {
    const code = err?.code || '';
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
      return lang === 'bn' ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' : 'Invalid email or password.';
    }
    if (code.includes('email-already-in-use')) {
      return lang === 'bn' ? 'এই ইমেইলে ইতোমধ্যে অ্যাকাউন্ট আছে।' : 'Account already exists with this email.';
    }
    if (code.includes('weak-password')) {
      return lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.';
    }
    if (code.includes('popup-closed-by-user')) {
      return lang === 'bn' ? 'সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।' : 'Sign-in popup closed.';
    }
    if (code.includes('too-many-requests')) {
      return lang === 'bn' ? 'অনেকবার ভুল চেষ্টা। কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'Too many attempts. Try again later.';
    }
    return err?.message || (lang === 'bn' ? 'অথেনটিকেশন ব্যর্থ হয়েছে।' : 'Authentication failed.');
  };

  // ─── Redirect Helper Based on Role ──────────────────────────────────────────
  const handlePostAuthRedirect = (role) => {
    const normalized = (role || '').toLowerCase().trim();
    if (normalized === 'admin') {
      navigate('/dashboard', { replace: true });
    } else {
      // standard user -> home page
      navigate('/', { replace: true });
    }
  };

  // ─── Form Submit Handler ───────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');

    // Forgot password tab
    if (activeTab === 'forgot') {
      try {
        setLoading(true);
        await resetPassword(data.email.trim());
        setSuccessMsg(
          lang === 'bn'
            ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।'
            : 'Password reset link sent to your email.'
        );
        triggerToast(lang === 'bn' ? 'রিসেট লিংক পাঠানো হয়েছে!' : 'Reset link sent!');
      } catch (err) {
        setErrorMsg(formatFirebaseError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Signup tab
    if (activeTab === 'signup') {
      try {
        setLoading(true);
        const res = await registerWithEmail(data.email.trim(), data.password, data.displayName.trim());
        const synced = await syncAndFetchRole(res.user);
        triggerToast(lang === 'bn' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created!');
        handlePostAuthRedirect(synced?.role || 'user');
      } catch (err) {
        setErrorMsg(formatFirebaseError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login tab
    try {
      setLoading(true);
      const res = await loginWithEmail(data.email.trim(), data.password);
      const synced = await syncAndFetchRole(res.user);
      triggerToast(lang === 'bn' ? 'স্বাগতম! সফলভাবে লগইন হয়েছে।' : 'Welcome back!');
      handlePostAuthRedirect(synced?.role);
    } catch (err) {
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      setSocialLoading(true);
      const res = await loginWithGoogle();
      const synced = await syncAndFetchRole(res.user);
      triggerToast(lang === 'bn' ? 'Google দিয়ে সাইন ইন হয়েছে!' : 'Signed in with Google!');
      handlePostAuthRedirect(synced?.role);
    } catch (err) {
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setSocialLoading(false);
    }
  };

  const isDisabled = loading || socialLoading;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#040e09] overflow-hidden selection:bg-emerald-500 selection:text-black">

      {/* Background Effects */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-emerald-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-[#F42A41]/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-950/40 blur-[160px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#F42A41] to-emerald-500 z-20" />

      {/* Back to Website */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-8 z-30">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-emerald-300 hover:text-emerald-200 border border-emerald-500/20 hover:border-emerald-500/40 text-xs sm:text-sm font-medium backdrop-blur-md transition-all shadow-lg group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>{lang === 'bn' ? 'মূল ওয়েবসাইটে ফিরে যান' : 'Back to Website'}</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-5xl my-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-emerald-500/20 bg-[#071710]/85 backdrop-blur-2xl shadow-[0_0_60px_-15px_rgba(0,106,78,0.35)] overflow-hidden relative z-10">

        {/* Left Branding Panel */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-gradient-to-br from-[#062417] via-[#041910] to-[#020d08] border-r border-emerald-900/40 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-6">
              <Shield size={14} className="text-emerald-400" />
              <span>SakkhiBD Transparency</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              {lang === 'bn' ? 'দুর্নীতিমুক্ত আগামীর স্বচ্ছ প্ল্যাটফর্ম' : 'Empowering Transparency & Truth'}
            </h2>
            <p className="text-sm text-emerald-100/70 mt-3 leading-relaxed">
              {lang === 'bn'
                ? 'সরাসরি তথ্য, নাগরিক অভিযোগ এবং জবাবদিহিতা নিশ্চিত করতে যুক্ত হোন।'
                : 'Access public ledgers, submit reports, and monitor accountability in real-time.'}
            </p>
          </div>

          <div className="space-y-4 my-8 relative z-10">
            {[
              { Icon: Scale, titleBn: 'নাগরিক অধিকার ও নিরাপত্তা', titleEn: 'Citizen Protection', descBn: 'সম্পূর্ণ এনক্রিপ্টেড এবং নিরাপদ প্ল্যাটফর্ম', descEn: 'Secure encrypted identity and authenticated access' },
              { Icon: FileText, titleBn: 'স্বচ্ছ লেজার ট্র্যাকিং', titleEn: 'Public Ledger Tracking', descBn: 'অভিযোগের নিরপেক্ষ পর্যালোচনা ও সত্যতা যাচাই', descEn: 'Verified corruption complaints repository' },
              { Icon: BarChart2, titleBn: 'লাইভ অ্যানালিটিক্স', titleEn: 'Live Analytics', descBn: '৬৪ জেলার রিয়েল-টাইম ডাটা বিশ্লেষণ', descEn: 'Real-time charts across all 64 districts' },
            ].map(({ Icon, titleBn, titleEn, descBn, descEn }) => (
              <div key={titleEn} className="flex items-start gap-3 p-3 rounded-2xl bg-black/25 border border-emerald-500/10">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0"><Icon size={18} /></div>
                <div>
                  <h4 className="text-xs font-bold text-white">{lang === 'bn' ? titleBn : titleEn}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{lang === 'bn' ? descBn : descEn}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-zinc-500 font-mono relative z-10">
            © {new Date().getFullYear()} SakkhiBD (সাক্ষীবিডি) · Public Transparency Platform
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">

          {/* Header */}
          <div className="text-center lg:text-left mb-6">
            <div className="lg:hidden inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white items-center justify-center mb-3 shadow-lg shadow-emerald-950">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeTab === 'forgot'
                ? (lang === 'bn' ? 'পাসওয়ার্ড উদ্ধার করুন' : 'Reset Password')
                : activeTab === 'signup'
                ? (lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account')
                : (lang === 'bn' ? 'অ্যাকাউন্টে লগইন করুন' : 'Welcome Back')}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {activeTab === 'forgot'
                ? (lang === 'bn' ? 'ইমেইল দিন, নিরাপদ রিসেট লিংক পাঠানো হবে।' : 'Enter your email to receive a password reset link.')
                : activeTab === 'signup'
                ? (lang === 'bn' ? 'স্বচ্ছ প্ল্যাটফর্মে যুক্ত হতে তথ্য প্রদান করুন।' : 'Fill in the details to join our platform.')
                : (lang === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করতে সাইন ইন করুন।' : 'Enter credentials to access the admin portal.')}
            </p>
          </div>

          {/* Tab Switcher */}
          {activeTab !== 'forgot' && (
            <div className="flex p-1 bg-black/40 rounded-2xl border border-emerald-900/60 mb-6">
              {['login', 'signup'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'login'
                    ? (lang === 'bn' ? 'লগইন (Sign In)' : 'Sign In')
                    : (lang === 'bn' ? 'সাইন আপ (Sign Up)' : 'Sign Up')}
                </button>
              ))}
            </div>
          )}

          {/* Alert Messages */}
          <Alert type="error" message={errorMsg} />
          <Alert type="success" message={successMsg} />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>

            {/* Full Name — signup only */}
            {activeTab === 'signup' && (
              <FormField
                label={lang === 'bn' ? 'আপনার নাম' : 'Full Name'}
                error={errors.displayName?.message}
                icon={User}
              >
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ রহিম' : 'e.g. Rahim Chowdhury'}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-all"
                  {...register('displayName', {
                    required: lang === 'bn' ? 'নাম আবশ্যক।' : 'Full name is required.',
                    minLength: { value: 2, message: lang === 'bn' ? 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।' : 'Name must be at least 2 characters.' },
                  })}
                />
              </FormField>
            )}

            {/* Email */}
            <FormField
              label={lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              error={errors.email?.message}
              icon={Mail}
            >
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-all"
                {...register('email', {
                  required: lang === 'bn' ? 'ইমেইল ঠিকানা আবশ্যক।' : 'Email is required.',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: lang === 'bn' ? 'সঠিক ইমেইল ঠিকানা দিন।' : 'Enter a valid email address.',
                  },
                })}
              />
            </FormField>

            {/* Password */}
            {activeTab !== 'forgot' && (
              <FormField
                label={lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                error={errors.password?.message}
                icon={Lock}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-all"
                  {...register('password', {
                    required: lang === 'bn' ? 'পাসওয়ার্ড আবশ্যক।' : 'Password is required.',
                    minLength: { value: 6, message: lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchTab('forgot')}
                    className="absolute -bottom-5 right-0 text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                )}
              </FormField>
            )}

            {/* Confirm Password — signup only */}
            {activeTab === 'signup' && (
              <FormField
                label={lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                error={errors.confirmPassword?.message}
                icon={Lock}
              >
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-all"
                  {...register('confirmPassword', {
                    required: lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন।' : 'Please confirm your password.',
                    validate: (val) =>
                      val === passwordValue || (lang === 'bn' ? 'উভয় পাসওয়ার্ড এক হতে হবে।' : 'Passwords do not match.'),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </FormField>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {activeTab === 'forgot'
                      ? (lang === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link')
                      : activeTab === 'signup'
                      ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account')
                      : (lang === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Sign In to Dashboard')}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Google Login — not on forgot tab */}
          {activeTab !== 'forgot' && (
            <div className="mt-4">
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-500">{lang === 'bn' ? 'অথবা' : 'or'}</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isDisabled}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-zinc-700 hover:border-zinc-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                {socialLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>{lang === 'bn' ? 'Google দিয়ে সাইন ইন করুন' : 'Continue with Google'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-5 text-center text-xs text-zinc-400">
            {activeTab === 'forgot' ? (
              <button type="button" onClick={() => switchTab('login')} className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer inline-flex items-center gap-1">
                <span>←</span>
                <span>{lang === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}</span>
              </button>
            ) : activeTab === 'signup' ? (
              <p>
                {lang === 'bn' ? 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
                <button type="button" onClick={() => switchTab('login')} className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer ml-1">
                  {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
                </button>
              </p>
            ) : (
              <p>
                {lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলতে চান?' : "Don't have an account?"}{' '}
                <button type="button" onClick={() => switchTab('signup')} className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer ml-1">
                  {lang === 'bn' ? 'নিবন্ধন করুন' : 'Create Account'}
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}