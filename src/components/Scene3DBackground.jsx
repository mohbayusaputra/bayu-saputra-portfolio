import React, { useRef, useEffect } from 'react';

export default function Scene3DBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReduced) return;

    let rafId = 0;
    let idleId = 0;
    let disposed = false;

    const startCanvas = () => {
      if (disposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const isMobile = window.innerWidth < 768;
      const starCount = isMobile ? 65 : 130;
      let w = 0;
      let h = 0;

      const resize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();

      const palette = [
        'rgba(125, 211, 252, ',
        'rgba(165, 180, 252, ',
        'rgba(248, 250, 252, ',
      ];

      const stars = Array.from({ length: starCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: 0.25 + Math.random() * 0.75,
        r: 0.7 + Math.random() * 1.4,
        c: palette[Math.floor(Math.random() * palette.length)],
        phase: Math.random() * Math.PI * 2,
      }));

      const mouse = { x: 0, y: 0, tx: 0, ty: 0, scroll: window.scrollY || 0 };

      const onMove = (e) => {
        mouse.tx = (e.clientX / (w || 1) - 0.5) * 26;
        mouse.ty = (e.clientY / (h || 1) - 0.5) * 18;
      };
      const onScroll = () => {
        mouse.scroll = window.scrollY || 0;
      };

      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });

      let lastTime = 0;
      const minInterval = isMobile ? 42 : 30; // ~24-33fps subtle ambient motion (minimal CPU/GPU)

      const render = (now) => {
        if (disposed) return;
        rafId = requestAnimationFrame(render);

        if (document.hidden || now - lastTime < minInterval) return;
        lastTime = now;

        const t = now * 0.0007;
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;

        ctx.clearRect(0, 0, w, h);

        // 1. Interactive Parallax Starfield
        const scrollShift = mouse.scroll * 0.06;
        for (let i = 0; i < starCount; i++) {
          const s = stars[i];
          const px = ((s.x * w + mouse.x * s.z + t * 8 * s.z) % w + w) % w;
          const py = ((s.y * h - scrollShift * s.z + mouse.y * s.z) % h + h) % h;
          const alpha = 0.28 + 0.35 * Math.sin(t * 2.2 + s.phase);

          ctx.beginPath();
          ctx.fillStyle = `${s.c}${alpha.toFixed(2)})`;
          ctx.arc(px, py, s.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Subtle Perspective Horizon Wave Lines at Bottom
        const horizonY = h * 0.76;
        const rows = isMobile ? 6 : 9;
        ctx.lineWidth = 1;

        for (let r = 0; r < rows; r++) {
          const depth = r / (rows - 1);
          const yBase = horizonY + Math.pow(depth, 1.55) * (h * 0.26);
          const alpha = 0.025 + depth * 0.045;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          const step = isMobile ? 36 : 28;
          for (let x = 0; x <= w + step; x += step) {
            const wave =
              Math.sin(x * 0.006 + t * 1.6 + r * 0.45) * (4 + depth * 9) +
              Math.cos(x * 0.003 - t * 1.1) * 3;
            const py = yBase + wave;
            if (x === 0) ctx.moveTo(x, py);
            else ctx.lineTo(x, py);
          }
          ctx.stroke();
        }
      };

      rafId = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('scroll', onScroll);
      };
    };

    let cleanupListeners;
    // Defer ambient canvas startup until browser idle after initial Hero paint
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => {
        cleanupListeners = startCanvas();
      }, { timeout: 1200 });
    } else {
      idleId = setTimeout(() => {
        cleanupListeners = startCanvas();
      }, 650);
    }

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if ('cancelIdleCallback' in window && idleId) {
        window.cancelIdleCallback(idleId);
      } else if (idleId) {
        clearTimeout(idleId);
      }
      cleanupListeners?.();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05070B]">
      {/* Architectural Subtle Grid Pattern with Radial Vignette Mask */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 25%, black 20%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 65% at 50% 25%, black 20%, transparent 100%)',
        }}
      />

      {/* Pre-Softened Volumetric Radial Spotlights (Zero GPU Blur-Filter Overhead!) */}
      <div
        className="absolute inset-x-0 -top-40 h-[620px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 20%, rgba(56,189,248,0.13) 0%, rgba(99,102,241,0.06) 45%, transparent 80%)',
        }}
      />
      <div
        className="absolute top-[35%] right-0 w-[600px] h-[600px]"
        style={{
          background:
            'radial-gradient(circle at 80% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[500px]"
        style={{
          background:
            'radial-gradient(circle at 20% 80%, rgba(56,189,248,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Lightweight Idle-Mounted Ambient Starfield & Wave Horizon */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
