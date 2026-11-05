import React, { useRef, useEffect } from 'react';

export default function Scene3DBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let idleId = 0;
    let rafId = 0;
    let disposed = false;
    let cleanup = null;

    const init = () => {
      if (disposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const isMobile = window.innerWidth < 768;
      const starCount = isMobile ? 55 : 115;
      let w = 0;
      let h = 0;

      const palette = [
        'rgba(125, 211, 252, ',
        'rgba(165, 180, 252, ',
        'rgba(248, 250, 252, ',
      ];

      const stars = Array.from({ length: starCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: 0.25 + Math.random() * 0.75,
        r: 0.7 + Math.random() * 1.35,
        c: palette[Math.floor(Math.random() * palette.length)],
        a: (0.25 + Math.random() * 0.45).toFixed(2),
      }));

      const offset = { x: 0, y: 0 };

      const draw = () => {
        if (disposed || !w || !h) return;
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < starCount; i++) {
          const s = stars[i];
          const px = ((s.x * w + offset.x * s.z) % w + w) % w;
          const py = ((s.y * h + offset.y * s.z) % h + h) % h;
          ctx.beginPath();
          ctx.fillStyle = `${s.c}${s.a})`;
          ctx.arc(px, py, s.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Subtle Perspective Horizon Wave Grid
        const horizonY = h * 0.76;
        const rows = isMobile ? 5 : 8;
        ctx.lineWidth = 1;

        for (let r = 0; r < rows; r++) {
          const depth = r / (rows - 1);
          const yBase = horizonY + Math.pow(depth, 1.55) * (h * 0.24);
          const alpha = 0.025 + depth * 0.045;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          const step = isMobile ? 40 : 30;
          for (let x = 0; x <= w + step; x += step) {
            const wave =
              Math.sin(x * 0.006 + r * 0.45 + offset.x * 0.03) * (4 + depth * 8) +
              Math.cos(x * 0.003) * 3;
            const py = yBase + wave;
            if (x === 0) ctx.moveTo(x, py);
            else ctx.lineTo(x, py);
          }
          ctx.stroke();
        }
      };

      const resize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
      };
      resize();

      let scheduled = false;
      const scheduleDraw = () => {
        if (scheduled) return;
        scheduled = true;
        rafId = requestAnimationFrame(() => {
          scheduled = false;
          draw();
        });
      };

      const onMove = (e) => {
        if (e.pointerType !== 'mouse') return;
        offset.x = (e.clientX / (w || 1) - 0.5) * 24;
        offset.y = (e.clientY / (h || 1) - 0.5) * 16;
        scheduleDraw();
      };

      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('pointermove', onMove, { passive: true });

      cleanup = () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onMove);
      };
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(init, { timeout: 1500 });
    } else {
      idleId = window.setTimeout(init, 800);
    }

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if ('cancelIdleCallback' in window && idleId) {
        window.cancelIdleCallback(idleId);
      } else if (idleId) {
        clearTimeout(idleId);
      }
      cleanup?.();
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

      {/* Pre-Softened Volumetric Radial Spotlights */}
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

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
