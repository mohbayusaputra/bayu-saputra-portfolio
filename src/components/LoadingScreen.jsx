import React, { useEffect, useRef, useState } from 'react';
import { Code2 } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [isOpening, setIsOpening] = useState(false);
  const pctRef = useRef(null);
  const sliderRef = useRef(null);
  const leftSeamRef = useRef(null);
  const rightSeamRef = useRef(null);
  const leftTeethRef = useRef(null);
  const rightTeethRef = useRef(null);

  useEffect(() => {
    let frameId = 0;
    let closeTimer = 0;
    const unzipDuration = 540;
    const doorDuration = 460;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const linear = Math.min(1, elapsed / unzipDuration);
      // Smooth easeInOutCubic for natural zipper pull momentum
      const eased =
        linear < 0.5
          ? 4 * linear * linear * linear
          : 1 - Math.pow(-2 * linear + 2, 3) / 2;

      const pct = Math.round(eased * 100);
      if (pctRef.current) {
        pctRef.current.textContent = `${String(pct).padStart(2, '0')}%`;
      }

      // 100% GPU-composited transforms (zero layout/paint thrashing!)
      const clampedY = 4 + eased * 92;
      if (sliderRef.current) {
        sliderRef.current.style.transform = `translate3d(-50%, ${clampedY}vh, 0) translateY(-50%)`;
      }
      if (leftSeamRef.current) {
        leftSeamRef.current.style.transform = `scaleY(${eased})`;
      }
      if (rightSeamRef.current) {
        rightSeamRef.current.style.transform = `scaleY(${eased})`;
      }
      const rem = Math.max(0, 1 - eased);
      if (leftTeethRef.current) {
        leftTeethRef.current.style.transform = `scaleY(${rem})`;
      }
      if (rightTeethRef.current) {
        rightTeethRef.current.style.transform = `scaleY(${rem})`;
      }

      if (linear < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setIsOpening(true);
        closeTimer = window.setTimeout(() => {
          onComplete?.();
        }, doorDuration);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(closeTimer);
    };
  }, [onComplete]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden select-none"
    >
      {/* LEFT VAULT DOOR */}
      <div
        style={{
          transform: isOpening ? 'translate3d(-102%, 0, 0)' : 'translate3d(0%, 0, 0)',
          transition: 'transform 0.46s cubic-bezier(0.76, 0, 0.24, 1)',
          willChange: 'transform',
        }}
        className="absolute inset-y-0 left-0 w-1/2 bg-[#060911] border-r border-sky-400/35 shadow-[12px_0_45px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-end pr-6 sm:pr-12"
      >
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
        <div
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-56 h-72"
          style={{
            background: 'radial-gradient(circle at 100% 50%, rgba(56,189,248,0.14), transparent 70%)',
          }}
        />

        {/* Left Zipper Teeth Edge (GPU scaleY from bottom) */}
        <div
          ref={leftTeethRef}
          className="absolute right-0 inset-y-0 w-2 origin-bottom"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, #64748B 0px, #64748B 5px, transparent 5px, transparent 12px)',
            willChange: 'transform',
          }}
        />

        {/* Glowing Unzipped Seam Edge on Left Door */}
        <div
          ref={leftSeamRef}
          className="absolute right-0 inset-y-0 w-[2px] origin-top bg-gradient-to-b from-sky-400/40 via-sky-300 to-cyan-300 shadow-[0_0_15px_#38BDF8]"
          style={{ transform: 'scaleY(0)', willChange: 'transform' }}
        />

        {/* Left Door Brand Typography */}
        <div className="relative z-10 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-[10px] sm:text-xs text-sky-300 tracking-wider uppercase">
              Portfolio
            </span>
          </div>
          <p className="font-display text-xl sm:text-4xl font-bold text-white tracking-tight">
            Bayu Saputra
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Web Developer &amp; Software Engineer
          </p>
        </div>
      </div>

      {/* RIGHT VAULT DOOR */}
      <div
        style={{
          transform: isOpening ? 'translate3d(102%, 0, 0)' : 'translate3d(0%, 0, 0)',
          transition: 'transform 0.46s cubic-bezier(0.76, 0, 0.24, 1)',
          willChange: 'transform',
        }}
        className="absolute inset-y-0 right-0 w-1/2 bg-[#060911] border-l border-indigo-400/35 shadow-[-12px_0_45px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-start pl-6 sm:pl-12"
      >
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
        <div
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-56 h-72"
          style={{
            background: 'radial-gradient(circle at 0% 50%, rgba(99,102,241,0.14), transparent 70%)',
          }}
        />

        {/* Right Interlocking Zipper Teeth Edge */}
        <div
          ref={rightTeethRef}
          className="absolute left-0 inset-y-0 w-2 origin-bottom"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, #64748B 6px, #64748B 11px, transparent 11px, transparent 12px)',
            willChange: 'transform',
          }}
        />

        {/* Glowing Unzipped Seam Edge on Right Door */}
        <div
          ref={rightSeamRef}
          className="absolute left-0 inset-y-0 w-[2px] origin-top bg-gradient-to-b from-indigo-400/40 via-sky-300 to-cyan-300 shadow-[0_0_15px_#38BDF8]"
          style={{ transform: 'scaleY(0)', willChange: 'transform' }}
        />

        {/* Right Door Percentage Readout */}
        <div className="relative z-10 text-left">
          <span
            ref={pctRef}
            className="font-mono text-3xl sm:text-6xl font-bold bg-gradient-to-r from-sky-300 via-white to-indigo-300 bg-clip-text text-transparent tabular-nums"
          >
            00%
          </span>
          <p className="font-mono text-[10px] sm:text-xs text-slate-400 mt-1.5 tracking-wide uppercase">
            {isOpening ? 'Opening Doors...' : 'Unlocking Workspace...'}
          </p>
        </div>
      </div>

      {/* CENTER ZIPPER SLIDER / PULL HEAD (Pure GPU translate3d) */}
      <div
        ref={sliderRef}
        style={{
          top: 0,
          transform: 'translate3d(-50%, 4vh, 0) translateY(-50%)',
          opacity: isOpening ? 0 : 1,
          transition: 'opacity 0.18s ease-out',
          willChange: 'transform, opacity',
        }}
        className="pointer-events-none absolute left-1/2 z-20 flex flex-col items-center"
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
