import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    let frameId;
    const duration = 1550;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const linear = Math.min(1, elapsed / duration);
      // Smooth easeInOutCubic for natural zipper pull momentum
      const eased =
        linear < 0.5
          ? 4 * linear * linear * linear
          : 1 - Math.pow(-2 * linear + 2, 3) / 2;
      const pct = Math.round(eased * 100);
      setProgress(pct);

      if (linear < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        // Trigger split sliding doors right as zipper reaches 100% at bottom!
        setIsOpening(true);
        setTimeout(() => {
          onComplete?.();
        }, 880);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden select-none">
      {/* LEFT VAULT DOOR */}
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: isOpening ? '-102%' : '0%' }}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-y-0 left-0 w-1/2 bg-[#060911] border-r border-sky-400/35 shadow-[12px_0_45px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-end pr-6 sm:pr-12"
      >
        {/* Subtle Engineering Grid on Left Door */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
          }}
        />
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-56 h-72 rounded-full bg-sky-500/10 blur-[90px]" />

        {/* Left Zipper Teeth Edge (Locked portion below slider) */}
        <div
          className="absolute right-0 w-2 transition-all duration-75"
          style={{
            top: `${progress}%`,
            bottom: 0,
            backgroundImage:
              'repeating-linear-gradient(to bottom, #64748B 0px, #64748B 5px, transparent 5px, transparent 12px)',
          }}
        />

        {/*Glowing Unzipped Seam Edge on Left Door */}
        <div
          className="absolute right-0 top-0 w-[2px] bg-gradient-to-b from-sky-400/40 via-sky-300 to-cyan-300 shadow-[0_0_15px_#38BDF8]"
          style={{ height: `${progress}%` }}
        />

        {/* Left Door Brand Typography */}
        <div className="relative z-10 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-[10px] sm:text-xs text-sky-300 tracking-wider uppercase">
              Portfolio
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-4xl font-bold text-white tracking-tight">
            Bayu Saputra
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Web Developer &amp; Software Engineer
          </p>
        </div>
      </motion.div>

      {/* RIGHT VAULT DOOR */}
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: isOpening ? '102%' : '0%' }}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-y-0 right-0 w-1/2 bg-[#060911] border-l border-indigo-400/35 shadow-[-12px_0_45px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-start pl-6 sm:pl-12"
      >
        {/* Subtle Engineering Grid on Right Door */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
          }}
        />
        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-56 h-72 rounded-full bg-indigo-500/10 blur-[90px]" />

        {/* Right Interlocking Zipper Teeth Edge (Offset by 6px so left & right teeth mesh!) */}
        <div
          className="absolute left-0 w-2 transition-all duration-75"
          style={{
            top: `${progress}%`,
            bottom: 0,
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, #64748B 6px, #64748B 11px, transparent 11px, transparent 12px)',
          }}
        />

        {/* Glowing Unzipped Seam Edge on Right Door */}
        <div
          className="absolute left-0 top-0 w-[2px] bg-gradient-to-b from-indigo-400/40 via-sky-300 to-cyan-300 shadow-[0_0_15px_#38BDF8]"
          style={{ height: `${progress}%` }}
        />

        {/* Right Door Percentage Readout */}
        <div className="relative z-10 text-left">
          <span className="font-mono text-3xl sm:text-6xl font-bold bg-gradient-to-r from-sky-300 via-white to-indigo-300 bg-clip-text text-transparent tabular-nums">
            {String(progress).padStart(2, '0')}%
          </span>
          <p className="font-mono text-[10px] sm:text-xs text-slate-400 mt-1.5 tracking-wide uppercase">
            {isOpening ? 'Opening Doors...' : 'Unlocking Workspace...'}
          </p>
        </div>
      </motion.div>

      {/* CENTER ZIPPER SLIDER / PULL HEAD (Glides from top 0% -> bottom 100%, fades as doors part) */}
      <motion.div
        animate={{
          opacity: isOpening ? 0 : 1,
          scale: isOpening ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
        style={{ top: `${Math.max(4, Math.min(96, progress))}%` }}
      >
        {/* Metallic Zipper Crown */}
        <div className="w-7 h-9 rounded-xl bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 p-[1.5px] shadow-[0_0_24px_rgba(56,189,248,0.85)]">
          <div className="w-full h-full rounded-[10px] bg-[#0B0F19] flex items-center justify-center">
            <div className="w-2 h-3.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38BDF8]" />
          </div>
        </div>
        {/* Hanging Zipper Pull Tab */}
        <div className="w-3.5 h-5 -mt-1 rounded-b-lg border-2 border-slate-300 bg-[#0D1322] shadow-md" />
      </motion.div>
    </div>
  );
}
