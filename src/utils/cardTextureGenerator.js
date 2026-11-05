import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
} from 'three';

/**
 * Loads Bayu's pre-processed crisp 1:1 HD portrait (/bayu-card-portrait.webp)
 * with zero main-thread pixel-loop overhead.
 */
export function loadCleanPortraitTexture(imageUrl, maxAnisotropy = 8, onComplete) {
  const loader = new TextureLoader();
  loader.load(
    imageUrl,
    (tex) => {
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.generateMipmaps = false;
      tex.minFilter = LinearFilter;
      tex.magFilter = LinearFilter;
      tex.needsUpdate = true;
      onComplete?.(tex);
    },
    undefined,
    () => {}
  );
}

/**
 * Crisp HD (1024 x 1536) Front Developer ID Card Texture
 */
export function createFrontCardTexture(maxAnisotropy = 8) {
  const logicalW = 1024;
  const logicalH = 1536;

  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = logicalW;
  frontCanvas.height = logicalH;
  const fctx = frontCanvas.getContext('2d');

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
  fctx.font = '700 19px "Inter", system-ui, sans-serif';
  fctx.fillText('VERIFIED', logicalW - 206, 127);

  // Exact 1:1 Square Portrait Frame (740 x 740)
  const frameSize = 740;
  const frameX = (logicalW - frameSize) / 2;
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
  fctx.font = '700 70px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
  fctx.fillText('Bayu Saputra', 84, 1040);

  fctx.fillStyle = '#38BDF8';
  fctx.font = '600 31px "Inter", system-ui, sans-serif';
  fctx.fillText('Web Developer & Software Engineer', 84, 1096);

  // Divider
  fctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  fctx.fillRect(84, 1146, logicalW - 168, 2);

  // Metadata Columns
  fctx.fillStyle = '#94A3B8';
  fctx.font = '500 21px "Inter", system-ui, sans-serif';
  fctx.fillText('Pendidikan', 84, 1198);
  fctx.fillText('Sertifikasi', 466, 1198);
  fctx.fillText('Domisili', 744, 1198);

  fctx.fillStyle = '#F8FAFC';
  fctx.font = '700 25px "Inter", system-ui, sans-serif';
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

  const frontTex = new CanvasTexture(frontCanvas);
  frontTex.colorSpace = SRGBColorSpace;
  frontTex.anisotropy = maxAnisotropy;
  frontTex.generateMipmaps = false;
  frontTex.minFilter = LinearFilter;
  frontTex.magFilter = LinearFilter;
  frontTex.needsUpdate = true;
  return frontTex;
}

/**
 * Crisp HD (1024 x 1536) Back Developer ID Card Texture
 */
export function createBackCardTexture(maxAnisotropy = 8) {
  const logicalW = 1024;
  const logicalH = 1536;

  const backCanvas = document.createElement('canvas');
  backCanvas.width = logicalW;
  backCanvas.height = logicalH;
  const bctx = backCanvas.getContext('2d');

  const bgGrad = bctx.createLinearGradient(0, 0, logicalW, logicalH);
  bgGrad.addColorStop(0, '#151924');
  bgGrad.addColorStop(0.55, '#0D1017');
  bgGrad.addColorStop(1, '#080A0F');
  bctx.fillStyle = bgGrad;
  bctx.fillRect(0, 0, logicalW, logicalH);

  bctx.fillStyle = '#040508';
  bctx.fillRect(0, 115, logicalW, 135);

  bctx.fillStyle = '#FFFFFF';
  bctx.font = '700 38px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
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
    bctx.font = '600 21px "Inter", system-ui, sans-serif';
    bctx.fillText(label, 84, y);

    bctx.fillStyle = '#F8FAFC';
    bctx.font = '600 26px "Inter", system-ui, sans-serif';
    bctx.fillText(val, 84, y + 38);

    bctx.fillStyle = 'rgba(255,255,255,0.09)';
    bctx.fillRect(84, y + 68, logicalW - 168, 2);
  });

  const backTex = new CanvasTexture(backCanvas);
  backTex.colorSpace = SRGBColorSpace;
  backTex.anisotropy = maxAnisotropy;
  backTex.generateMipmaps = false;
  backTex.minFilter = LinearFilter;
  backTex.magFilter = LinearFilter;
  backTex.needsUpdate = true;
  return backTex;
}

/**
 * Crisp Woven Lanyard Strap Texture (1024 x 128)
 */
export function createStrapTexture(maxAnisotropy = 8) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0F131D';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 2;
  for (let x = -128; x < canvas.width + 128; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 64, canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.fillRect(0, 4, canvas.width, 2.5);
  ctx.fillRect(0, canvas.height - 6.5, canvas.width, 2.5);

  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(38, canvas.height / 2, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 27px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('BAYU SAPUTRA     •     WEB DEVELOPER', 66, canvas.height / 2 + 1);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}
