import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, FlaskConical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!EMAIL_PATTERN.test(email.trim())) {
      toast({
        title: 'Enter a valid email address',
        className: 'bg-[#0B1F3A] border border-red-500/40 text-white',
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: 'Password must be at least 6 characters',
        className: 'bg-[#0B1F3A] border border-red-500/40 text-white',
      });
      return;
    }

    setSubmitting(true);
    // Demo/testnet auth only — no backend account system, no real credentials
    // are verified or stored anywhere beyond this session.
    timeoutRef.current = setTimeout(() => {
      setSubmitting(false);
      toast({
        title: 'Signed in',
        description: 'Welcome back to ATK Capital.',
        className: 'bg-[#0B1F3A] border border-emerald-500/40 text-white',
      });
      onSuccess();
    }, 500);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0B1F3A] text-slate-50 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#FFD700] flex items-center justify-center shadow-[0_0_25px_rgba(255,215,0,0.25)]">
            <span className="text-[#0B1F3A] font-bold font-mono text-lg tracking-tighter">ATK</span>
          </div>
          <span className="font-semibold tracking-[0.2em] text-white text-sm">ATK CAPITAL</span>
          <span
            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            data-testid="badge-testnet-mode-login"
          >
            <FlaskConical className="w-3 h-3" />
            Testnet Mode
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-5"
          data-testid="form-login"
        >
          <div>
            <h2 className="text-white font-semibold text-lg mb-1">Sign in</h2>
            <p className="text-slate-500 text-xs">Access your trading dashboard</p>
          </div>

          <div>
            <label htmlFor="login-email" className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
                className="w-full bg-black/30 border border-white/10 focus:border-[#FFD700]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 rounded-lg pl-10 pr-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                className="w-full bg-black/30 border border-white/10 focus:border-[#FFD700]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 rounded-lg pl-10 pr-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            data-testid="button-sign-in"
            className="mt-2 w-full px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 bg-[#FFD700] text-[#0B1F3A] hover:bg-[#FFE55C] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] shadow-[0_0_10px_rgba(255,215,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Signing In…' : 'Sign In'}
          </button>

          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 justify-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
            Demo access — no real account or funds
          </div>
        </form>
      </motion.div>
    </div>
  );
}
