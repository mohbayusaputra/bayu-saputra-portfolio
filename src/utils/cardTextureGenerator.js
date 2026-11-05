import * as THREE from 'three';

/**
 * Loads Bayu's 100% original untouched photo (/bayu-profile.jpg),
 * neutralizes ONLY the red pasfoto backdrop cleanly, performs multi-step
 * bicubic upscaling to 1024x1024 HD, and applies a pure optical Luminance
 * Unsharp Mask (zero AI alteration — 100% Bayu's real face, sharper & HD!).
 */
export function createCleanPortraitTexture(imageUrl, maxAnisotropy = 16, onComplete) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    // Step 1: Draw original pixels at native resolution to neutralize red background cleanly
    const srcSize = Math.min(img.width, img.height);
    const sx = Math.floor((img.width - srcSize) / 2);
    const sy = Math.floor((img.height - srcSize) / 2);

    const step0 = document.createElement('canvas');
    step0.width = srcSize;
    step0.height = srcSize;
    const ctx0 = step0.getContext('2d');
    ctx0.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, srcSize, srcSize);

    const rawData = ctx0.getImageData(0, 0, srcSize, srcSize);
    const rd = rawData.data;

    for (let i = 0; i < rd.length; i += 4) {
      const r = rd[i];
      const g = rd[i + 1];
      const b = rd[i + 2];

      const redExcess = r - Math.max(g, b);
      if (redExcess > 38 && g < 86 && b < 86) {
        const strength = Math.min(1, (redExcess - 38) / 42);
        // Smooth dark studio slate backdrop (#181B24)
        const targetR = 24;
        const targetG = 27;
        const targetB = 36;
        rd[i] = Math.round(r * (1 - strength) + targetR * strength);
        rd[i + 1] = Math.round(g * (1 - strength) + targetG * strength);
        rd[i + 2] = Math.round(b * (1 - strength) + targetB * strength);
      }
    }
    ctx0.putImageData(rawData, 0, 0);

    // Step 2: Progressive 2x Bicubic Upscaling (eliminates single-step bilinear blur)
    const sizes = [384, 768, 1024];
    let currentCanvas = step0;

    for (const nextSize of sizes) {
      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = nextSize;
      nextCanvas.height = nextSize;
      const nctx = nextCanvas.getContext('2d');
      nctx.imageSmoothingEnabled = true;
      nctx.imageSmoothingQuality = 'high';
      nctx.drawImage(currentCanvas, 0, 0, nextSize, nextSize);
      currentCanvas = nextCanvas;
    }

    // Step 3: Pure Optical Luminance Unsharp Mask (restores crisp eye, hair & collar detail)
    const finalSize = 1024;
    const fctx = currentCanvas.getContext('2d');

    // Create slightly blurred copy for unsharp mask kernel
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = finalSize;
    blurCanvas.height = finalSize;
    const bctx = blurCanvas.getContext('2d');
    bctx.filter = 'blur(1.1px)';
    bctx.drawImage(currentCanvas, 0, 0);

    const sharpImg = fctx.getImageData(0, 0, finalSize, finalSize);
    const blurImg = bctx.getImageData(0, 0, finalSize, finalSize);
    const sd = sharpImg.data;
    const bd = blurImg.data;
    const amount = 0.52;

    for (let i = 0; i < sd.length; i += 4) {
      const diffR = sd[i] - bd[i];
      const diffG = sd[i + 1] - bd[i + 1];
      const diffB = sd[i + 2] - bd[i + 2];

      // Threshold small JPEG noise (< 3) while sharpening true edges
      if (Math.abs(diffR) + Math.abs(diffG) + Math.abs(diffB) > 7) {
        sd[i] = Math.max(0, Math.min(255, Math.round(sd[i] + diffR * amount)));
        sd[i + 1] = Math.max(0, Math.min(255, Math.round(sd[i + 1] + diffG * amount)));
        sd[i + 2] = Math.max(0, Math.min(255, Math.round(sd[i + 2] + diffB * amount)));
      }
    }
    fctx.putImageData(sharpImg, 0, 0);

    const tex = new THREE.CanvasTexture(currentCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    // Disable blurry mipmap down-switching so portrait stays 100% HD at any tilt angle
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    onComplete(tex);
  };
  img.src = imageUrl;
}

/**
 * 4K Ultra-HD (2048 x 3072) Dark Developer ID Card Textures
 */
export function createCardShellTextures(maxAnisotropy = 16) {
  const scale = 2; // 2048 x 3072 4K Ultra-HD
  const logicalW = 1024;
  const logicalH = 1536;

  // --- FRONT ---
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = logicalW * scale;
  frontCanvas.height = logicalH * scale;
  const fctx = frontCanvas.getContext('2d');
  fctx.scale(scale, scale);

  // Crisp Deep Obsidian Gradient
  const bgGrad = fctx.createLinearGradient(0, 0, logicalW, logicalH);
  bgGrad.addColorStop(0, '#151924');
  bgGrad.addColorStop(0.55, '#0D1017');
  bgGrad.addColorStop(1, '#080A0F');
  fctx.fillStyle = bgGrad;
  fctx.fillRect(0, 0, logicalW, logicalH);

  // Subtle Outer Rim Hairline on Print
  fctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  fctx.lineWidth = 3;
  fctx.beginPath();
  fctx.roundRect(16, 16, logicalW - 32, logicalH - 32, 36);
  fctx.stroke();

  // Top Sky-Indigo Laser Accent Bar
  const accentGrad = fctx.createLinearGradient(0, 0, logicalW, 0);
  accentGrad.addColorStop(0, '#38BDF8');
  accentGrad.addColorStop(0.6, '#818CF8');
  accentGrad.addColorStop(1, 'rgba(129, 140, 248, 0.1)');
  fctx.fillStyle = accentGrad;
  fctx.fillRect(0, 0, logicalW, 14);

  // Punched Lanyard Slot
  fctx.fillStyle = '#040508';
  fctx.beginPath();
  fctx.roundRect(logicalW / 2 - 72, 42, 144, 24, 12);
  fctx.fill();
  fctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  fctx.lineWidth = 2;
  fctx.stroke();

  // Header & Status Badge
  fctx.fillStyle = '#CBD5E1';
  fctx.font = '600 22px "JetBrains Mono", monospace';
  fctx.fillText('DEVELOPER ID PASS', 84, 132);

  // Verified Pill on Right
  fctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
  fctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  fctx.lineWidth = 2.5;
  fctx.beginPath();
  fctx.roundRect(logicalW - 258, 98, 174, 44, 22);
  fctx.fill();
  fctx.stroke();

  fctx.fillStyle = '#38BDF8';
  fctx.beginPath();
  fctx.arc(logicalW - 226, 120, 7, 0, Math.PI * 2);
  fctx.fill();

  fctx.fillStyle = '#F0F9FF';
  fctx.font = '700 19px "Inter", sans-serif';
  fctx.fillText('VERIFIED', logicalW - 206, 127);

  // Exact 1:1 Square Portrait Frame (740 x 740 — Zero Horizontal Stretch!)
  const frameSize = 740;
  const frameX = (logicalW - frameSize) / 2; // 142
  const frameY = 186;

  fctx.fillStyle = '#181B24';
  fctx.beginPath();
  fctx.roundRect(frameX - 8, frameY - 8, frameSize + 16, frameSize + 16, 22);
  fctx.fill();

  fctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
  fctx.lineWidth = 3;
  fctx.beginPath();
  fctx.roundRect(frameX - 8, frameY - 8, frameSize + 16, frameSize + 16, 22);
  fctx.stroke();

  // Name & Role
  fctx.fillStyle = '#FFFFFF';
  fctx.font = '700 70px "Plus Jakarta Sans", "Inter", sans-serif';
  fctx.fillText('Bayu Saputra', 84, 1040);

  fctx.fillStyle = '#38BDF8';
  fctx.font = '600 31px "Inter", sans-serif';
  fctx.fillText('Web Developer & Software Engineer', 84, 1096);

  // Divider
  fctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  fctx.fillRect(84, 1146, logicalW - 168, 2);

  // Metadata Columns
  fctx.fillStyle = '#94A3B8';
  fctx.font = '500 21px "Inter", sans-serif';
  fctx.fillText('Pendidikan', 84, 1198);
  fctx.fillText('Sertifikasi', 466, 1198);
  fctx.fillText('Domisili', 744, 1198);

  fctx.fillStyle = '#F8FAFC';
  fctx.font = '700 25px "Inter", sans-serif';
  fctx.fillText('D4 TI — PCR (3.70)', 84, 1240);
  fctx.fillText('BNSP & MTCNA', 466, 1240);
  fctx.fillText('Pekanbaru', 744, 1240);

  // Crisp Vector Barcode + Smart Chip
  fctx.fillStyle = 'rgba(248, 250, 252, 0.78)';
  let bx = 84;
  const bars = [5, 3, 9, 3, 4, 6, 10, 3, 4, 4, 8, 3, 4, 9, 3, 6, 4, 8, 3, 5];
  bars.forEach((w, i) => {
    if (i % 2 === 0) fctx.fillRect(bx, 1326, w, 60);
    bx += w + 5;
  });

  fctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
  fctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
  fctx.lineWidth = 3;
  fctx.beginPath();
  fctx.roundRect(logicalW - 194, 1318, 110, 76, 14);
  fctx.fill();
  fctx.stroke();
  fctx.beginPath();
  fctx.moveTo(logicalW - 158, 1318);
  fctx.lineTo(logicalW - 158, 1394);
  fctx.moveTo(logicalW - 120, 1318);
  fctx.lineTo(logicalW - 120, 1394);
  fctx.moveTo(logicalW - 194, 1356);
  fctx.lineTo(logicalW - 84, 1356);
  fctx.stroke();

  // --- BACK ---
  const backCanvas = document.createElement('canvas');
  backCanvas.width = logicalW * scale;
  backCanvas.height = logicalH * scale;
  const bctx = backCanvas.getContext('2d');
  bctx.scale(scale, scale);

  bctx.fillStyle = bgGrad;
  bctx.fillRect(0, 0, logicalW, logicalH);

  bctx.fillStyle = '#040508';
  bctx.fillRect(0, 115, logicalW, 135);

  bctx.fillStyle = '#FFFFFF';
  bctx.font = '700 38px "Plus Jakarta Sans", "Inter", sans-serif';
  bctx.fillText('Profil & Kredensial Singkat', 84, 345);
  bctx.fillStyle = '#38BDF8';
  bctx.fillRect(84, 372, 72, 5);

  const rows = [
    ['Pendidikan', 'D4 Teknik Informatika — PCR (IPK 3.70 / 4.00)'],
    ['Pencapaian', 'Awardee Beasiswa Pemkab Rokan Hilir × PCR (2022)'],
    ['Magang', 'Web Developer Intern — Balai Bahasa Prov. Riau'],
    ['Sertifikasi', 'BNSP Programmer (Lulus) & MTCNA (2024–2027)'],
    ['Pelatihan', 'Dicoding: Dasar AI & Prompt Engineering Dev'],
    ['Tech Stack', 'Laravel, Tailwind CSS, CodeIgniter, PHP, JS, Kotlin'],
  ];

  rows.forEach(([label, val], idx) => {
    const y = 450 + idx * 140;
    bctx.fillStyle = '#94A3B8';
    bctx.font = '600 21px "Inter", sans-serif';
    bctx.fillText(label, 84, y);

    bctx.fillStyle = '#F8FAFC';
    bctx.font = '600 26px "Inter", sans-serif';
    bctx.fillText(val, 84, y + 38);

    bctx.fillStyle = 'rgba(255,255,255,0.09)';
    bctx.fillRect(84, y + 68, logicalW - 168, 2);
  });

  const frontTex = new THREE.CanvasTexture(frontCanvas);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  frontTex.anisotropy = maxAnisotropy;
  frontTex.generateMipmaps = false;
  frontTex.minFilter = THREE.LinearFilter;
  frontTex.magFilter = THREE.LinearFilter;
  frontTex.needsUpdate = true;

  const backTex = new THREE.CanvasTexture(backCanvas);
  backTex.colorSpace = THREE.SRGBColorSpace;
  backTex.anisotropy = maxAnisotropy;
  backTex.generateMipmaps = false;
  backTex.minFilter = THREE.LinearFilter;
  backTex.magFilter = THREE.LinearFilter;
  backTex.needsUpdate = true;

  return { frontTex, backTex };
}

/**
 * Ultra-HD (2048 x 256) Woven Lanyard Strap Texture with Crisp Typography
 */
export function createStrapTexture(maxAnisotropy = 16) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Deep Woven Strap Base
  ctx.fillStyle = '#0F131D';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle Woven Diagonal Micro-Ribbing
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 3;
  for (let x = -256; x < canvas.width + 256; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 128, canvas.height);
    ctx.stroke();
  }

  // Cyan-Slate Edge Stitching Lines
  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.fillRect(0, 8, canvas.width, 4);
  ctx.fillRect(0, canvas.height - 12, canvas.width, 4);

  // Accent Dot
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(76, canvas.height / 2, 11, 0, Math.PI * 2);
  ctx.fill();

  // Sharp High-Contrast Strap Print
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 54px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('BAYU SAPUTRA     •     WEB DEVELOPER', 132, canvas.height / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}
