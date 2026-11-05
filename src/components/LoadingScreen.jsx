import React from 'react';
import { Code2 } from 'lucide-react';

/**
 * 100% Pure CSS GPU-Composited Zipper & Split Smoked-Glass Vault Doors.
 * Zero main-thread JS timers or React state mutations, allowing instant FCP/LCP!
 */
export default function LoadingScreen() {
  return (
    <div
      aria-hidden="true"
      className="vault-loader-root fixed inset-0 z-[100] pointer-events-none overflow-hidden select-none"
    >
      {/* LEFT SMOKED-GLASS VAULT DOOR */}
      <div className="vault-door-left absolute inset-y-0 left-0 w-1/2 bg-[#060911]/82 border-r border-sky-400/35 shadow-[12px_0_45px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-end pr-6 sm:pr-12">
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
            background: 'radial-gradient(circle at 100% 50%, rgba(56,189,248,0.16), transparent 70%)',
          }}
        />

        {/* Left Zipper Teeth Edge */}
        <div
          className="vault-teeth absolute right-0 inset-y-0 w-2 origin-bottom"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, #64748B 0px, #64748B 5px, transparent 5px, transparent 12px)',
          }}
        />

        {/* Glowing Unzipped Seam Edge on Left Door */}
        <div className="vault-seam absolute right-0 inset-y-0 w-[2px] origin-top bg-gradient-to-b from-sky-400/40 via-sky-300 to-cyan-300 shadow-[0_0_15px_#38BDF8]" />

        {/* Left Door Brand Typography */}
        <div className="relative z-10 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] mb-3">
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-[10px] sm:text-xs text-sky-300 tracking-wider uppercase">
              Portfolio
            </span>
          </div>
          <p className="font-display text-xl sm:text-4xl font-bold text-white tracking-tight">
            Bayu Saputra
          </p>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
            Web Developer &amp; Software Engineer
          </p>
        </div>
      </div>

      {/* RIGHT SMOKED-GLASS VAULT DOOR */}
      <div className="vault-door-right absolute inset-y-0 right-0 w-1/2 bg-[#060911]/82 border-l border-indigo-400/35 shadow-[-12px_0_45px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-start pl-6 sm:pl-12">
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
            background: 'radial-gradient(circle at 0% 50%, rgba(99,102,241,0.16), transparent 70%)',
          }}
        />

        {/* Right Interlocking Zipper Teeth Edge */}
        <div
          className="vault-teeth absolute left-0 inset-y-0 w-2 origin-bottom"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, #64748B 6px, #64748B 11px, transparent 11px, transparent 12px)',
          }}
        />

        {/* Glowing Unzipped Seam Edge on Right Door */}
        <div className="vault-seam absolute left-0 inset-y-0 w-[2px] origin-top bg-gradient-to-b from-indigo-400/40 via-sky-300 to-cyan-300 shadow-[0_0_15px_#38BDF8]" />

        {/* Right Door Status Badge + GPU Progress Track */}
        <div className="relative z-10 text-left w-32 sm:w-44">
          <span className="font-mono text-2xl sm:text-5xl font-bold text-sky-300 tracking-tight block">
            READY
          </span>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="vault-progress-bar h-full w-full origin-left bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full" />
          </div>
          <p className="font-mono text-[10px] sm:text-xs text-slate-300 mt-2 tracking-wide uppercase">
            Unlocking Door...
          </p>
        </div>
      </div>

      {/* CENTER ZIPPER SLIDER / PULL HEAD (Pure CSS Compositor Keyframe) */}
      <div className="vault-zipper-pull pointer-events-none absolute left-1/2 top-0 z-20 flex flex-col items-center">
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
