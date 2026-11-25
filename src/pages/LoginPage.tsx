import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Modal } from '../components/ui/Modal';
import { SkeletonBlock } from '../components/ui/Skeleton';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useReducedMotion } from '../hooks/useReducedMotion';

const MedicalHeartScene = lazy(() => import('../features/auth/MedicalHeartScene'));

function SceneSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#EEF5FF] p-8">
      <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-[#0070F3]/20 bg-white/80">
        <SkeletonBlock className="h-24 w-24 rounded-full" />
      </div>
      <SkeletonBlock className="mt-6 h-4 w-48" />
      <SkeletonBlock className="mt-2 h-3 w-36" />
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Administrator email is required.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    }

    return valid;
  };

  const triggerShake = () => {
    setShakeForm(false);
    window.requestAnimationFrame(() => {
      setShakeForm(true);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password, rememberMe);
    setIsSubmitting(false);

    if (!res.ok) {
      triggerShake();
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        message: res.error || 'Incorrect email or password.',
      });
      return;
    }

    showToast({
      type: 'success',
      title: 'Welcome back, Administrator',
      message: 'Session verified. Opening MediCore 3D robotics console.',
    });
    navigate('/dashboard', { replace: true });
  };

  const fillDemoCredentials = () => {
    setEmail('admin@medicore.demo');
    setPassword('Demo@1234');
    setEmailError('');
    setPasswordError('');
    showToast({
      type: 'info',
      title: 'Demo credentials filled',
      message: 'Click Sign In to enter the hospital console.',
    });
  };

  const handleOneClickDemoLogin = async () => {
    setEmail('admin@medicore.demo');
    setPassword('Demo@1234');
    setEmailError('');
    setPasswordError('');
    setIsSubmitting(true);
    const res = await login('admin@medicore.demo', 'Demo@1234', rememberMe);
    setIsSubmitting(false);
    if (res.ok) {
      showToast({
        type: 'success',
        title: 'Demo Session Active',
        message: 'Entered MediCore 3D hospital console.',
      });
      navigate('/dashboard', { replace: true });
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = resetEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setResetError('Please enter a valid institutional email address.');
      return;
    }
    setResetError('');
    setResetSent(true);
    showToast({
      type: 'success',
      title: 'Recovery instructions sent',
      message: `Password reset link dispatched to ${trimmed}.`,
    });
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="relative min-h-screen w-full overflow-x-hidden bg-[#EEF5FF] text-[#05080F]"
    >
      {/* Full-Bleed 3D Robotics & Cardiac Animation Behind Login Details */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<SceneSkeleton />}>
          <MedicalHeartScene />
        </Suspense>
      </div>

      {/* Foreground Layer (pointer-events-none lets backdrop & camera dock stay interactive) */}
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-between px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
        {/* Top Bar */}
        <header className="flex items-center justify-between gap-3">
          <div className="pointer-events-auto rounded-xl border border-white/90 bg-white/75 px-3.5 py-2 shadow-sm shadow-[#0070F3]/10 backdrop-blur-sm">
            <Logo />
          </div>

          <div className="pointer-events-auto flex items-center gap-3">
            <div className="hidden rounded-xl border border-white/90 bg-white/75 px-3.5 py-2 text-right shadow-sm shadow-[#0070F3]/10 backdrop-blur-sm md:block">
              <p className="font-display text-xs font-bold text-[#000000]">
                Biomechatronic Cardiac &amp; Surgical Telemetry
              </p>
              <p className="text-[11px] font-medium text-[#1E293B]">
                Move cursor to inspect · Precision WebGL unit
              </p>
            </div>
            <PWAInstallButton />
          </div>
        </header>

        {/* Centered Translucent Login Card Over 3D Robotics Scene */}
        <main className="my-4 flex flex-1 items-center justify-center sm:my-6">
          <div className="pointer-events-auto w-full max-w-[430px] rounded-2xl border border-white/95 bg-white/52 p-5 shadow-2xl shadow-[#0070F3]/15 ring-1 ring-[#05080F]/10 backdrop-blur-[4px] sm:p-7">
            <div className="mb-5">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#000000] sm:text-[26px] text-balance">
                Surgical Robotics &amp; Hospital Sign In
              </h1>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#1E293B]">
                Access automated ward telemetry, surgical rosters, patient registries, and clinical billing controls.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              onAnimationEnd={() => setShakeForm(false)}
              className={`space-y-4 ${shakeForm ? 'animate-shake' : ''}`}
            >
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold text-[#000000]">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#1E293B]"
                    aria-hidden="true"
                  />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="admin@medicore.demo"
                    aria-invalid={Boolean(emailError)}
                    className={`w-full rounded-xl border bg-white/92 py-2.5 pr-4 pl-10 text-sm font-medium text-[#000000] placeholder-[#475569] transition-colors focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0070F3]/40 ${
                      emailError
                        ? 'border-[#E11D48] focus:border-[#E11D48]'
                        : 'border-[#94A3B8]/80 focus:border-[#0070F3]'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1.5 text-xs font-semibold text-[#E11D48]" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold text-[#000000]">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#1E293B]"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Enter your password"
                    aria-invalid={Boolean(passwordError)}
                    className={`w-full rounded-xl border bg-white/92 py-2.5 pr-11 pl-10 text-sm font-medium text-[#000000] placeholder-[#475569] transition-colors focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0070F3]/40 ${
                      passwordError
                        ? 'border-[#E11D48] focus:border-[#E11D48]'
                        : 'border-[#94A3B8]/80 focus:border-[#0070F3]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1.5 text-[#1E293B] transition-colors hover:bg-[#EBF4FF] hover:text-[#0070F3]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1.5 text-xs font-semibold text-[#E11D48]" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#1E293B] select-none hover:text-[#000000]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#64748B] bg-white accent-[#0070F3]"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetSent(false);
                    setResetError('');
                    setForgotOpen(true);
                  }}
                  className="text-xs font-bold text-[#0070F3] transition-colors hover:text-[#005DD1]"
                >
                  Forgot password?
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={reducedMotion ? undefined : { scale: 0.99 }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0070F3] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0070F3]/25 transition-colors hover:bg-[#005DD1] disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo Access Hint */}
            <div className="mt-4 rounded-xl border border-[#93C5FD] bg-white/70 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#000000]">
                  <KeyRound className="h-3.5 w-3.5 text-[#0070F3]" />
                  <span>Demo Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="rounded-lg border border-[#60A5FA] bg-white px-2.5 py-1 text-xs font-bold text-[#0070F3] transition-colors hover:bg-[#EFF6FF] whitespace-nowrap"
                  >
                    Auto-fill
                  </button>
                  <button
                    type="button"
                    onClick={handleOneClickDemoLogin}
                    className="rounded-lg bg-[#0070F3] px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-[#005DD1] whitespace-nowrap"
                  >
                    Demo Sign In
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1 text-xs font-medium text-[#1E293B] sm:grid-cols-2">
                <div>
                  <span>Email: </span>
                  <span className="font-mono font-bold text-[#000000]">admin@medicore.demo</span>
                </div>
                <div>
                  <span>Password: </span>
                  <span className="font-mono font-bold text-[#000000]">Demo@1234</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom-Left Footer */}
        <footer className="flex items-center justify-between">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-white/90 bg-white/75 px-3.5 py-2 text-xs font-semibold text-[#1E293B] shadow-sm shadow-[#0070F3]/10 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#0D9F6E]" />
            <span>MediCore Apex Hospital · Precision Robotics Operations Console</span>
          </div>
        </footer>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset Administrator Password"
        subtitle="Enter your hospital email to receive recovery instructions."
      >
        {resetSent ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 text-sm text-[#05080F]">
              <p className="font-bold text-[#047857]">Recovery Email Dispatched</p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[#334155]">
                If <span className="font-mono font-bold text-[#000000]">{resetEmail}</span> matches an active
                hospital administrator account, password reset instructions have been sent.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-bold text-white hover:bg-[#005DD1]"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reset-email" className="mb-1.5 block text-xs font-bold text-[#000000]">
                Registered Hospital Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setResetError('');
                }}
                placeholder="admin@medicore.demo"
                className="w-full rounded-xl border border-[#94A3B8]/80 bg-[#F4F8FF] px-3.5 py-2.5 text-sm font-medium text-[#000000] placeholder-[#475569] focus:border-[#0070F3] focus:bg-white focus:outline-none"
              />
              {resetError && <p className="mt-1.5 text-xs font-semibold text-[#E11D48]">{resetError}</p>}
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="rounded-lg border border-[#CBD5E1] px-4 py-2 text-xs font-semibold text-[#1E293B] hover:text-[#000000]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-bold text-white hover:bg-[#005DD1]"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
}
