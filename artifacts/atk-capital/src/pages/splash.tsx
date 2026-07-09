import { motion } from 'framer-motion';
import { useEffect } from 'react';

const SPLASH_DURATION_MS = 2200;

export default function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, SPLASH_DURATION_MS);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <motion.div
      className="min-h-[100dvh] bg-[#0B1F3A] flex flex-col items-center justify-center gap-6 overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="screen-splash"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.4, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-20 h-20 rounded-2xl bg-[#FFD700] flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.35)]"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[#0B1F3A] font-bold font-mono text-2xl tracking-tighter"
        >
          ATK
        </motion.span>
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-[#FFD700]"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
        />
      </motion.div>

      <div className="overflow-hidden">
        <motion.h1
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-white font-semibold tracking-[0.3em] text-lg sm:text-xl"
          data-testid="text-splash-logo"
        >
          ATK CAPITAL
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.7, ease: 'easeOut' }}
        className="h-px w-24 bg-gradient-to-r from-transparent via-[#FFD700]/70 to-transparent"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-slate-500 text-[10px] uppercase tracking-[0.25em] font-mono"
      >
        Testnet Trading Terminal
      </motion.p>
    </motion.div>
  );
}
