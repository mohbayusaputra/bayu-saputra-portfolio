import React, { useRef, useEffect } from 'react';

function createGlowSprite(innerColor, midColor, outerColor) {
  const size = 48;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.32, midColor);
  grad.addColorStop(0.7, outerColor);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/**
 * Animated 3D Perspective Wave Grid + Rotating 3D Glowing Starfield Background.
 * Restores the signature undulating 3D wireframe horizon wave & interactive floating stars,
 * adapted seamlessly for both Dark Mode and Light Mode.
 */
export default function Scene3DBackground({ theme = 'dark' }) {
  const canvasRef = useRef(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let disposed = false;
    let rafId = 0;
    let w = 0;
    let h = 0;

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 140 : 280;

    // Pre-baked soft radial-glow sprites for Dark & Light modes
    const darkSprites = [
      createGlowSprite('rgba(255,255,255,0.95)', 'rgba(125,211,252,0.72)', 'rgba(56,189,248,0.14)'),
      createGlowSprite('rgba(255,255,255,0.92)', 'rgba(165,180,252,0.68)', 'rgba(99,102,241,0.14)'),
      createGlowSprite('rgba(255,255,255,0.95)', 'rgba(241,245,249,0.65)', 'rgba(148,163,184,0.10)'),
    ];
    const lightSprites = [
      createGlowSprite('rgba(2,132,199,0.75)', 'rgba(14,165,233,0.42)', 'rgba(56,189,248,0.08)'),
      createGlowSprite('rgba(79,70,229,0.70)', 'rgba(99,102,241,0.38)', 'rgba(129,140,248,0.08)'),
      createGlowSprite('rgba(15,23,42,0.48)', 'rgba(71,85,105,0.24)', 'rgba(100,116,139,0.05)'),
    ];

    // 3D Starfield coordinates matching original InteractiveStarfield volume
    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * 28,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 14 - 2,
      size: 0.9 + Math.random() * 1.1,
      variant: Math.random() < 0.5 ? 0 : Math.random() < 0.8 ? 1 : 2,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // 3D Perspective Wave Mesh matching original PlaneGeometry(38, 22, cols, rows) rotated -0.44*PI at [0, -4.6, -6]
    const cols = isMobile ? 26 : 42;
    const rows = isMobile ? 16 : 24;
    const vertCount = (cols + 1) * (rows + 1);
    const baseX = new Float32Array(vertCount);
    const baseY = new Float32Array(vertCount);
    const baseZ = new Float32Array(vertCount);
    const projX = new Float32Array(vertCount);
    const projY = new Float32Array(vertCount);
    const projVis = new Uint8Array(vertCount);

    const tilt = -Math.PI * 0.44;
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);

    let idx = 0;
    for (let r = 0; r <= rows; r++) {
      const py = (0.5 - r / rows) * 22;
      for (let c = 0; c <= cols; c++) {
        const px = (c / cols - 0.5) * 38;
        // RotateX(-0.44 * PI)
        baseX[idx] = px;
        baseY[idx] = py * cosTilt;
        baseZ[idx] = py * sinTilt;
        idx++;
      }
    }

    const mouse = { x: 0, y: 0, scroll: 0 };
    const smooth = { starX: 0, starY: 0, rotY: 0, rotZ: 0 };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onMove = (e) => {
      mouse.x = (e.clientX / Math.max(1, w) - 0.5) * 2;
      mouse.y = (e.clientY / Math.max(1, h) - 0.5) * 2;
    };
    const onScroll = () => {
      mouse.scroll = window.scrollY || 0;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const camZ = 9;
    const fovFactor = 1 / Math.tan((50 * Math.PI) / 360);
    let startTime = performance.now();
    let prevTime = startTime;

    const renderFrame = (now) => {
      if (disposed) return;
      rafId = requestAnimationFrame(renderFrame);

      if (document.hidden || !w || !h) {
        prevTime = now;
        return;
      }

      // Cap mobile frame interval cleanly (~36fps mobile, 60fps desktop)
      const dtMs = now - prevTime;
      if (isMobile && dtMs < 26) return;
      const dt = Math.min(0.05, dtMs / 1000);
      prevTime = now;

      const elapsed = (now - startTime) * 0.001;
      const isDark = themeRef.current === 'dark';

      ctx.clearRect(0, 0, w, h);

      const halfW = w * 0.5;
      const halfH = h * 0.5;
      const scale = halfH * fovFactor;

      // 1. Update & Draw 3D Rotating Starfield
      smooth.rotY += dt * 0.022;
      const targetStarX = mouse.x * 0.65;
      const targetStarY = -mouse.y * 0.4 + ((mouse.scroll * 0.0014) % 10);
      smooth.starX += (targetStarX - smooth.starX) * 0.05;
      smooth.starY += (targetStarY - smooth.starY) * 0.05;

      const cosRY = Math.cos(smooth.rotY);
      const sinRY = Math.sin(smooth.rotY);
      const sprites = isDark ? darkSprites : lightSprites;

      ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';

      for (let i = 0; i < starCount; i++) {
        const s = stars[i];
        const rx = s.x * cosRY + s.z * sinRY + smooth.starX;
        const rz = -s.x * sinRY + s.z * cosRY;
        // Wrap vertical scroll smoothly inside [-10, 10]
        let ry = ((s.y + smooth.starY + 10) % 20 + 20) % 20 - 10;

        const depth = camZ - rz;
        if (depth <= 0.6) continue;

        const invZ = scale / depth;
        const sx = halfW + rx * invZ;
        const sy = halfH - ry * invZ;
        if (sx < -24 || sx > w + 24 || sy < -24 || sy > h + 24) continue;

        const twinkle = 0.72 + 0.28 * Math.sin(elapsed * 1.8 + s.twinklePhase);
        const radius = Math.max(2.2, Math.min(13, (0.22 * s.size * invZ) * twinkle));

        ctx.globalAlpha = isDark ? 0.78 * twinkle : 0.62 * twinkle;
        ctx.drawImage(sprites[s.variant], sx - radius, sy - radius, radius * 2, radius * 2);
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      // 2. Project & Draw 3D Undulating Wireframe Perspective Wave Grid
      const tWave = elapsed * 0.62;
      smooth.rotZ += (mouse.x * 0.035 - smooth.rotZ) * 0.04;
      const cosRZ = Math.cos(smooth.rotZ);
      const sinRZ = Math.sin(smooth.rotZ);

      for (let i = 0; i < vertCount; i++) {
        const bx = baseX[i];
        const bz = baseZ[i];
        const wave = Math.sin(bx * 0.28 + tWave) * 0.3 + Math.cos(bz * 0.32 + tWave * 0.8) * 0.24;
        const lx = bx;
        const ly = baseY[i] + wave;

        // Apply subtle Z-bank rotation around mesh origin [0, -4.6, -6]
        const wx = lx * cosRZ - ly * sinRZ;
        const wy = lx * sinRZ + ly * cosRZ - 4.6;
        const wz = bz - 6;

        const depth = camZ - wz;
        if (depth <= 0.4) {
          projVis[i] = 0;
          continue;
        }
        const invZ = scale / depth;
        projX[i] = halfW + wx * invZ;
        projY[i] = halfH - wy * invZ;
        projVis[i] = 1;
      }

      ctx.lineWidth = isDark ? 0.85 : 0.95;
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.095)' : 'rgba(2, 132, 199, 0.14)';

      // Horizontal wireframe lines + diagonal/vertical mesh lines
      ctx.beginPath();
      const stride = cols + 1;
      for (let r = 0; r <= rows; r++) {
        const rowOff = r * stride;
        let started = false;
        for (let c = 0; c <= cols; c++) {
          const k = rowOff + c;
          if (!projVis[k]) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(projX[k], projY[k]);
            started = true;
          } else {
            ctx.lineTo(projX[k], projY[k]);
          }
        }
      }

      for (let c = 0; c <= cols; c++) {
        let started = false;
        for (let r = 0; r <= rows; r++) {
          const k = r * stride + c;
          if (!projVis[k]) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(projX[k], projY[k]);
            started = true;
          } else {
            ctx.lineTo(projX[k], projY[k]);
          }
        }
      }
      ctx.stroke();
    };

    // Start animation right after initial paint frame
    const bootId = requestAnimationFrame((now) => {
      startTime = now;
      prevTime = now;
      rafId = requestAnimationFrame(renderFrame);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(bootId);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-slate-50 dark:bg-[#05070B] transition-colors duration-300">
      {/* Architectural Grid Pattern with Radial Vignette Mask */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-[0.35]"
        style={{
          backgroundImage: isDark
            ? `
              linear-gradient(to right, rgba(148, 163, 184, 0.07) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.07) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, rgba(100, 116, 139, 0.09) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(100, 116, 139, 0.09) 1px, transparent 1px)
            `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 25%, black 20%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 65% at 50% 25%, black 20%, transparent 100%)',
        }}
      />

      {/* Volumetric Ambient Spotlights Adapted to Active Theme */}
      <div
        className="absolute inset-x-0 -top-40 h-[620px]"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 62% 55% at 50% 20%, rgba(56,189,248,0.14) 0%, rgba(99,102,241,0.07) 45%, transparent 80%)'
            : 'radial-gradient(ellipse 65% 55% at 50% 18%, rgba(14,165,233,0.13) 0%, rgba(99,102,241,0.07) 48%, transparent 82%)',
        }}
      />
      <div
        className="absolute top-[35%] right-0 w-[600px] h-[600px]"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle at 80% 50%, rgba(99,102,241,0.09) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[500px]"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 20% 80%, rgba(56,189,248,0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle at 20% 80%, rgba(14,165,233,0.09) 0%, transparent 70%)',
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
