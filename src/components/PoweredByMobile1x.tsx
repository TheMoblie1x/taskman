import React from 'react';
import { motion } from 'motion/react';

interface PoweredByMobile1xProps {
  className?: string;
  variant?: 'compact' | 'badge' | 'footer';
}

export const PoweredByMobile1x: React.FC<PoweredByMobile1xProps> = ({
  className = '',
  variant = 'compact',
}) => {
  if (variant === 'badge') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-slate-100/10 border border-slate-200/80 dark:border-slate-700/80 text-[10px] text-slate-500 dark:text-slate-400 select-none shadow-2xs ${className}`}
        title="Powered by mobile1x platform"
      >
        <span className="text-[9px] font-medium tracking-tight">powered by</span>
        <div className="flex items-center gap-1 font-bold tracking-tight text-slate-800 dark:text-slate-200">
          <svg
            className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Clean geometric mobile1x emblem */}
            <rect x="3" y="3" width="18" height="18" rx="4" className="stroke-blue-600 dark:stroke-blue-400 fill-blue-50/50 dark:fill-blue-950/40" />
            <path d="M7 16V8l5 5 5-5v8" className="stroke-blue-600 dark:stroke-blue-400" />
          </svg>
          <span>mobile<span className="text-blue-600 dark:text-blue-400 font-extrabold">1x</span></span>
        </div>
      </motion.div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 py-3 text-center ${className}`}>
        <motion.a
          href="https://mobile1x.com"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -1 }}
          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/60 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs transition-all duration-150"
        >
          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
            powered by
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-100">
            <svg
              className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="4.5" className="stroke-blue-600 dark:stroke-blue-400 fill-blue-50/40 dark:fill-blue-950/40" />
              <path d="M7 16V8l5 5 5-5v8" className="stroke-blue-600 dark:stroke-blue-400" />
            </svg>
            <span className="tracking-tight">
              mobile<span className="text-blue-600 dark:text-blue-400 font-black">1x</span>
            </span>
          </div>
        </motion.a>
      </div>
    );
  }

  // Default compact variant for sidebar bottom & header
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 transition-colors hover:border-slate-300 dark:hover:border-slate-600 ${className}`}
      title="Engineered with mobile1x"
    >
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        Powered by
      </span>
      <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 text-[11px] tracking-tight">
        <svg
          className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:rotate-6 transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="4.5" className="stroke-blue-600 dark:stroke-blue-400 fill-blue-50 dark:fill-blue-950/40" />
          <path d="M7 16V8l5 5 5-5v8" className="stroke-blue-600 dark:stroke-blue-400" />
        </svg>
        <span>
          mobile<span className="text-blue-600 dark:text-blue-400 font-black">1x</span>
        </span>
      </div>
    </motion.div>
  );
};
