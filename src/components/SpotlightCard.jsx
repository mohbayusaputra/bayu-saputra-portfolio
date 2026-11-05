import React, { useRef, useState } from 'react';

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(56, 189, 248, 0.14)',
  onClick,
}) {
  const divRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-3xl bg-[#0D111A]/80 backdrop-blur-xl border border-white/[0.08] hover:border-sky-400/30 transition-all duration-300 shadow-[0_16px_40px_-15px_rgba(0,0,0,0.65)] ${className}`}
    >
      {/* Dynamic Cursor Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(480px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 45%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
