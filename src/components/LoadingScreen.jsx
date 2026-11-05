import React, { useEffect, useRef, useState } from 'react';

/**
 * ~5-Second (00% -> 100%) Zipper & Split-Door Intro Loader.
 * Updates DOM transforms & tabular counter directly via refs (0ms React re-render overhead),
 * keeping Core Web Vitals smooth while delivering a full ~5s unzipping entrance.
 */
export default function LoadingScreen() {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'opening' | 'done'
  const counterRef = useRef(null);
  const statusRef = useRef(null);
  const barRef = useRef(null);
  const zipperRef = useRef(null);
  const leftSeamRef = useRef(null);
  const rightSeamRef = useRef(null);
  const leftTeethRef = useRef(null);
  const rightTeethRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done');
      return;
    }

    const DURATION_MS = 4800; // ~4.8s count to 100% + 200ms hold = ~5.0s before doors slide open
    let rafId = 0;
    let openTimer = 0;
    let doneTimer = 0;
    let lastPct = -1;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const raw = Math.min(1, Math.max(0, elapsed / DURATION_MS));
      // Smooth ease-in-out curve with steady visible progress all the way to 100%
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const pct = Math.min(100, Math.round(eased * 100));

      if (pct !== lastPct) {
        lastPct = pct;
        if (counterRef.current) {
          counterRef.current.textContent = `${String(pct).padStart(2, '0')}%`;
        }
        if (statusRef.current) {
          if (pct < 35) statusRef.current.textContent = 'Menyiapkan Halaman...';
          else if (pct < 80) statusRef.current.textContent = 'Memuat Portofolio...';
          else if (pct < 100) statusRef.current.textContent = 'Hampir Selesai...';
          else statusRef.current.textContent = 'Membuka Halaman...';
        }
      }

      const clampedY = 4 + eased * 92;
      if (zipperRef.current) {
        zipperRef.current.style.transform = `translate3d(-50%, ${clampedY}vh, 0) translateY(-50%)`;
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${eased.toFixed(4)})`;
      }
      if (leftSeamRef.current) {
        leftSeamRef.current.style.transform = `scaleY(${eased.toFixed(4)})`;
      }
      if (rightSeamRef.current) {
        rightSeamRef.current.style.transform = `scaleY(${eased.toFixed(4)})`;
      }
      const rem = Math.max(0, 1 - eased).toFixed(4);
      if (leftTeethRef.current) {
        leftTeethRef.current.style.transform = `scaleY(${rem})`;
      }
      if (rightTeethRef.current) {
        rightTeethRef.current.style.transform = `scaleY(${rem})`;
      }

      if (raw < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        openTimer = window.setTimeout(() => {
          setPhase('opening');
          doneTimer = window.setTimeout(() => {
            setPhase('done');
          }, 820);
        }, 200);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(openTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  const isOpening = phase === 'opening';

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden select-none">
      {/* LEFT VAULT DOOR */}
      <div
        className={`absolute inset-y-0 left-0 w-[calc(50%-2px)] bg-slate-50/[0.95] dark:bg-[#060911]/[0.94] border-r border-sky-500/40 dark:border-sky-400/40 shadow-[12px_0_45px_rgba(15,23,42,0.18)] dark:shadow-[12px_0_45px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-end pr-5 sm:pr-12 transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${
          isOpening ? '-translate-x-[106%]' : 'translate-x-0'
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35 dark:opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-56 h-72"
          style={{
            background: 'radial-gradient(circle at 100% 50%, rgba(56,189,248,0.18), transparent 70%)',
          }}
        />

        {/* Left Zipper Teeth Edge */}
        <div
          ref={leftTeethRef}
          className="absolute right-0 inset-y-0 w-2 origin-bottom will-change-transform"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, #64748B 0px, #64748B 5px, transparent 5px, transparent 12px)',
          }}
        />

        {/* Glowing Unzipped Seam Edge on Left Door */}
        <div
          ref={leftSeamRef}
          style={{ transform: 'scaleY(0)' }}
          className="absolute right-0 inset-y-0 w-[2px] origin-top bg-gradient-to-b from-sky-500/40 via-sky-400 to-cyan-300 shadow-[0_0_15px_#38BDF8] will-change-transform"
        />

        {/* Left Door Brand Typography */}
        <div className="relative z-10 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/[0.05] dark:bg-white/[0.05] border border-slate-900/10 dark:border-white/[0.1] mb-3">
            <img src="/favicon.svg" alt="" width="16" height="16" className="w-4 h-4 rounded" />
            <span className="font-mono text-[10px] sm:text-xs text-sky-600 dark:text-sky-300 tracking-wider uppercase font-semibold">
              Portofolio
            </span>
          </div>
          <p className="font-display text-xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bayu Saputra
          </p>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1">
            Web Developer &amp; Software Engineer
          </p>
        </div>
      </div>

      {/* RIGHT VAULT DOOR */}
      <div
        className={`absolute inset-y-0 right-0 w-[calc(50%-2px)] bg-slate-50/[0.95] dark:bg-[#060911]/[0.94] border-l border-indigo-500/40 dark:border-indigo-400/40 shadow-[-12px_0_45px_rgba(15,23,42,0.18)] dark:shadow-[-12px_0_45px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-start pl-5 sm:pl-12 transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${
          isOpening ? 'translate-x-[106%]' : 'translate-x-0'
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35 dark:opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
          }}
        />
        <div
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-56 h-72"
          style={{
            background: 'radial-gradient(circle at 0% 50%, rgba(99,102,241,0.18), transparent 70%)',
          }}
        />

        {/* Right Interlocking Zipper Teeth Edge */}
        <div
          ref={rightTeethRef}
          className="absolute left-0 inset-y-0 w-2 origin-bottom will-change-transform"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, #64748B 6px, #64748B 11px, transparent 11px, transparent 12px)',
          }}
        />

        {/* Glowing Unzipped Seam Edge on Right Door */}
        <div
          ref={rightSeamRef}
          style={{ transform: 'scaleY(0)' }}
          className="absolute left-0 inset-y-0 w-[2px] origin-top bg-gradient-to-b from-indigo-500/40 via-sky-400 to-cyan-300 shadow-[0_0_15px_#38BDF8] will-change-transform"
        />

        {/* Right Door Live 00% -> 100% Counter + Progress Track */}
        <div className="relative z-10 text-left w-36 sm:w-48">
          <span
            ref={counterRef}
            className="font-mono text-3xl sm:text-5xl font-bold text-sky-600 dark:text-sky-300 tracking-tight block tabular-nums"
          >
            00%
          </span>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-900/10 dark:bg-white/10 overflow-hidden">
            <div
              ref={barRef}
              style={{ transform: 'scaleX(0)' }}
              className="h-full w-full origin-left bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-sky-400 dark:to-indigo-400 rounded-full will-change-transform"
            />
          </div>
          <p
            ref={statusRef}
            className="font-mono text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 mt-2 tracking-wide uppercase"
          >
            Menyiapkan Halaman...
          </p>
        </div>
      </div>

      {/* CENTER ZIPPER SLIDER / PULL HEAD */}
      <div
        ref={zipperRef}
        style={{ transform: 'translate3d(-50%, 4vh, 0) translateY(-50%)' }}
        className={`pointer-events-none absolute left-1/2 top-0 z-20 flex flex-col items-center transition-opacity duration-200 will-change-transform ${
          isOpening ? 'opacity-0 scale-90' : 'opacity-100'
        }`}
      >
        <div className="w-7 h-9 rounded-xl bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 p-[1.5px] shadow-[0_0_24px_rgba(56,189,248,0.85)]">
          <div className="w-full h-full rounded-[10px] bg-[#0B0F19] flex items-center justify-center">
            <div className="w-2 h-3.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38BDF8]" />
          </div>
        </div>
        <div className="w-3.5 h-5 -mt-1 rounded-b-lg border-2 border-slate-300 bg-[#0D1322] shadow-md" />
      </div>
    </div>
  );
}
