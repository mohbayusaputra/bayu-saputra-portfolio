import React, { useRef } from 'react';

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(56, 189, 248, 0.14)',
  onClick,
}) {
  const divRef = useRef(null);
  const spotRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = divRef.current;
    const spot = spotRef.current;
    if (!el || !spot) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spot.style.background = `radial-gradient(480px circle at ${x}px ${y}px, ${spotlightColor}, transparent 45%)`;
  };

  const handleEnter = () => {
    if (spotRef.current) spotRef.current.style.opacity = '1';
  };

  const handleLeave = () => {
    if (spotRef.current) spotRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={divRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative overflow-hidden rounded-3xl bg-white/90 dark:bg-[#0D111A]/95 md:bg-white/80 md:dark:bg-[#0D111A]/82 md:backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] hover:border-sky-500/45 dark:hover:border-sky-400/30 transition-colors duration-300 shadow-[0_14px_34px_-12px_rgba(15,23,42,0.08)] dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.65)] ${className}`}
    >
      {/* Dynamic Cursor Spotlight — Direct DOM Update (Zero React Re-renders) */}
      <div
        ref={spotRef}
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
