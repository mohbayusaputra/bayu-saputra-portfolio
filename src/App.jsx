import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  Eye,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  Hand,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Phone,
  RefreshCw,
  RotateCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Scene3DBackground from './components/Scene3DBackground';
import LanyardScene from './components/LanyardScene';
import SpotlightCard from './components/SpotlightCard';
import LoadingScreen from './components/LoadingScreen';
import { TECH_STACK_ITEMS } from './components/TechIcons';
import { SOCIAL_LINKS } from './components/SocialIcons';

const ROLES = ['Web Developer', 'Software Engineer'];

const NAV_ITEMS = [
  { id: 'top', label: 'Profil', mobileLabel: 'Profil', href: '#top', Icon: User },
  { id: 'keahlian', label: 'Tech Stack', mobileLabel: 'Tech', href: '#keahlian', Icon: Cpu },
  { id: 'proyek', label: 'Proyek', mobileLabel: 'Proyek', href: '#proyek', Icon: FolderGit2 },
  { id: 'pengalaman', label: 'Kredensial', mobileLabel: 'Kredensial', href: '#pengalaman', Icon: Award },
  { id: 'kontak', label: 'Kontak', mobileLabel: 'Kontak', href: '#kontak', Icon: Mail },
];

// Previewable Documents & Official Certificates (Read-Only High-DPI Pages)
const PREVIEW_DOCS = {
  cv: {
    title: 'Curriculum Vitae — Bayu Saputra',
    subtitle: 'Pratinjau Dokumen CV (Read-Only)',
    pages: ['/previews/cv-p1.png'],
  },
  magang: {
    title: 'Sertifikat Magang — Balai Bahasa Provinsi Riau',
    subtitle: 'Kemendikdasmen · Nomor 12/G5.3/Magang/2026 (1 Sep 2025 – 2 Jan 2026)',
    pages: ['/previews/magang-p1.png'],
  },
  mtcna: {
    title: 'MikroTik Certified Network Associate (MTCNA)',
    subtitle: 'Certificate ID: 2407NA0799 · Berlaku 24 Juli 2024 – 24 Juli 2027',
    pages: ['/previews/mtcna-p1.png'],
    verifyUrl: 'https://mikrotik.com/certificates',
    verifyLabel: 'Verifikasi di MikroTik',
  },
  promptEng: {
    title: 'Prompt Engineering untuk Software Developer',
    subtitle: 'Dicoding Indonesia · ID: 0LZ0J1JKKX65 · Berlaku s.d. 02 Sep 2029',
    pages: ['/previews/prompt-eng-p1.png', '/previews/prompt-eng-p2.png'],
    verifyUrl: 'https://www.dicoding.com/certificates/0LZ0J1JKKX65',
    verifyLabel: 'Verifikasi Sertifikat Dicoding',
  },
  dasarAi: {
    title: 'Belajar Dasar AI',
    subtitle: 'Dicoding Indonesia · ID: 2VX3V1V8VPYQ · Berlaku s.d. 02 Sep 2029',
    pages: ['/previews/dasar-ai-p1.png', '/previews/dasar-ai-p2.png'],
    verifyUrl: 'https://www.dicoding.com/certificates/2VX3V1V8VPYQ',
    verifyLabel: 'Verifikasi Sertifikat Dicoding',
  },
};

// 3 Real Live Production Websites at Balai Bahasa Provinsi Riau (Kemendikdasmen)
const LIVE_KEMENDIKDASMEN_PROJECTS = [
  {
    id: 'ppid-riau',
    title: 'Portal PPID Balai Bahasa Provinsi Riau',
    subtitle: 'Layanan Informasi Publik Resmi',
    org: 'Balai Bahasa Provinsi Riau (Kemendikdasmen)',
    url: 'https://ppidbbpriau.kemendikdasmen.go.id/',
    displayUrl: 'ppidbbpriau.kemendikdasmen.go.id',
    badge: 'Live Production',
    image: '/projects/ppid-live.png',
    Icon: Globe,
    summary:
      'Portal resmi layanan keterbukaan informasi publik sesuai UU No. 14 Tahun 2008 lengkap dengan permohonan informasi daring dan pelacakan status.',
    details:
      'Dirancang dan dibangun menggunakan Laravel, Tailwind CSS, dan Alpine.js dengan metode Prototyping untuk mendukung transparansi layanan informasi publik Balai Bahasa Provinsi Riau (Kemendikdasmen). Menyediakan klasifikasi Informasi Berkala, Serta Merta, Setiap Saat, dan Dikecualikan, alur pengajuan permohonan informasi & keberatan, serta pelacakan status permohonan.',
    tech: ['Laravel', 'Tailwind CSS', 'Alpine.js', 'PHP', 'MySQL'],
  },
  {
    id: 'sapa-tamu',
    title: 'SAPA — Sistem Aspirasi & Pelayanan',
    subtitle: 'Absensi Buku Tamu Digital Terintegrasi QR',
    org: 'Balai Bahasa Provinsi Riau (Kemendikdasmen)',
    url: 'https://ppidbbpriau.kemendikdasmen.go.id/portal/tamu',
    displayUrl: 'ppidbbpriau.kemendikdasmen.go.id/portal/tamu',
    badge: 'Live Portal',
    image: '/projects/sapa-live.png',
    Icon: UserCheck,
    summary:
      'Website absensi tamu dan aspirasi layanan digital untuk pencatatan kunjungan masyarakat secara paperless lewat perangkat kantor maupun QR ponsel.',
    details:
      'Modul pelayanan kunjungan pada ekosistem portal Balai Bahasa Provinsi Riau yang dibangun dengan Laravel dan Tailwind CSS. Memudahkan pengunjung mengisi daftar hadir & keperluan layanan secara mandiri (termasuk lewat pemindaian QR Code di ponsel) untuk berbagai layanan seperti UKBI, Ahli Bahasa, Perpustakaan, Penerjemahan, BIPA, hingga Peminjaman Aula.',
    tech: ['Laravel', 'Tailwind CSS', 'JavaScript', 'QR Mobile Access', 'MySQL'],
  },
  {
    id: 'skm-survei',
    title: 'SKM — Survei Kepuasan Masyarakat',
    subtitle: 'Evaluasi Layanan PermenPANRB No. 14/2017',
    org: 'Balai Bahasa Provinsi Riau (Kemendikdasmen)',
    url: 'https://ppidbbpriau.kemendikdasmen.go.id/portal/survei',
    displayUrl: 'ppidbbpriau.kemendikdasmen.go.id/portal/survei',
    badge: 'Live Portal',
    image: '/projects/skm-live.png',
    Icon: ClipboardCheck,
    summary:
      'Portal kuesioner Survei Kepuasan Masyarakat daring 2 tahap sesuai standar PermenPANRB Nomor 14 Tahun 2017 dengan akses QR responsif.',
    details:
      'Sistem pengumpulan dan rekapitulasi umpan balik kepuasan pengguna layanan Balai Bahasa Provinsi Riau berbasis Laravel & Tailwind CSS. Mengimplementasikan formulir bertahap (Identitas Responden & 9 Unsur Penilaian Pelayanan Publik sesuai PermenPANRB No. 14 Tahun 2017) serta kotak saran digital.',
    tech: ['Laravel', 'Tailwind CSS', 'Multi-Step Form', 'PermenPANRB 14/2017', 'MySQL'],
  },
];

// Proyek Akhir & Proyek Mata Kuliah
const ACADEMIC_PROJECTS = [
  {
    id: 'psb',
    title: 'Sistem Penerimaan Santri Baru (PSB Online)',
    org: 'Proyek Akhir · Pondok Pesantren Bidayatul Hidayah',
    category: 'Web',
    badge: 'Proyek Akhir · Live',
    Icon: GraduationCap,
    accent: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
    summary:
      'Sistem informasi pendaftaran santri baru berbasis web pada Proyek Akhir menggunakan metode User-Centered Design (UCD) untuk digitalisasi alur registrasi dan berkas.',
    details:
      'Proyek Akhir D4 Teknik Informatika berjudul "Rancang Bangun Sistem Informasi Penerimaan Santri Baru Berbasis Web dengan Metode User-Centered Design (Studi Kasus: Pondok Pesantren Bidayatul Hidayah)". Dibangun menggunakan Laravel dan Tailwind CSS untuk mempermudah proses pendaftaran wali santri secara daring serta verifikasi berkas oleh pihak pesantren.',
    tech: ['Laravel', 'Tailwind CSS', 'User-Centered Design (UCD)', 'PHP', 'MySQL'],
  },
  {
    id: 'papan-informasi',
    title: 'Papan Informasi Digital Berbasis Web',
    org: 'Proyek Mata Kuliah · Pengembangan Web',
    category: 'Web',
    badge: 'Proyek Matkul',
    Icon: Monitor,
    accent: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/25',
    summary:
      'Aplikasi web pengelolaan konten layar informasi digital untuk menampilkan jadwal, pengumuman, dan informasi kegiatan secara dinamis.',
    details:
      'Dikembangkan sebagai proyek mata kuliah menggunakan framework Laravel agar pengumuman, agenda kegiatan, dan informasi visual pada layar monitor dapat diperbarui dengan praktis melalui halaman pengelola.',
    tech: ['Laravel', 'Tailwind CSS', 'PHP', 'MySQL'],
  },
  {
    id: 'drowsiness',
    title: 'Deteksi Kantuk Pengendara Real-Time',
    org: 'Proyek Mata Kuliah · Computer Vision',
    category: 'AI & ML',
    badge: 'Proyek Matkul',
    Icon: Eye,
    accent: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
    summary:
      'Eksplorasi aplikasi web pemantau kewaspadaan pengendara melalui kamera secara langsung menggunakan deteksi area mata berbasis Computer Vision.',
    details:
      'Proyek mata kuliah yang memanfaatkan kamera web secara real-time untuk mendeteksi penutupan mata pengendara dan memberikan peringatan dini apabila terindikasi mengantuk.',
    tech: ['Computer Vision', 'JavaScript', 'Real-Time Camera', 'Image Processing'],
  },
  {
    id: 'healthyme',
    title: 'Healthy Me — Rekomendasi Makanan BMR & K-Means',
    org: 'Proyek Mata Kuliah · Mobile & Machine Learning',
    category: 'Mobile & AI',
    badge: 'Proyek Matkul',
    Icon: Smartphone,
    accent: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
    summary:
      'Aplikasi Android penentu rekomendasi menu makanan harian berdasarkan perhitungan kalori BMR dan pengelompokan nutrisi K-Means.',
    details:
      'Dikembangkan pada proyek mata kuliah menggunakan Kotlin di Android Studio untuk menghitung Basal Metabolic Rate (BMR) pengguna serta menerapkan dasar Machine Learning (K-Means Clustering) dalam mengelompokkan rekomendasi nutrisi makanan.',
    tech: ['Kotlin', 'Android Studio', 'K-Means Clustering', 'Machine Learning'],
  },
  {
    id: 'leapgesture',
    title: 'LeapGesture — Prediksi Gestur Tangan (CNN)',
    org: 'Proyek Mata Kuliah (Tim) · Deep Learning',
    category: 'Mobile & AI',
    badge: 'Proyek Matkul · Tim',
    Icon: BrainCircuit,
    accent: 'text-violet-400 bg-violet-400/10 border-violet-400/25',
    summary:
      'Proyek kolaborasi tim yang mengimplementasikan model Convolutional Neural Network (CNN) pada aplikasi mobile untuk mengenali gestur tangan.',
    details:
      'Dikerjakan bersama tim pada proyek mata kuliah dengan melatih model dasar Deep Learning berbasis CNN menggunakan Google Colab dan Jupyter Notebook untuk mengklasifikasikan gestur tangan dan mengintegrasikannya ke aplikasi mobile.',
    tech: ['Deep Learning (CNN)', 'Kotlin', 'Google Colab', 'Jupyter Notebook'],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [roleIdx, setRoleIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [impulseKey, setImpulseKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeSection, setActiveSection] = useState('top');
  const [selectedProject, setSelectedProject] = useState(null);
  const [previewDocKey, setPreviewDocKey] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);

  const email = 'bayusaputra100704@gmail.com';
  const activePreviewDoc = previewDocKey ? PREVIEW_DOCS[previewDocKey] : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIdx((prev) => (prev + 1) % ROLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll-Spy for Desktop Top Navbar & Mobile Bottom App Bar
  useEffect(() => {
    const sectionIds = ['top', 'keahlian', 'proyek', 'pengalaman', 'kontak'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.32;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openDocPreview = (key) => {
    setZoomLevel(1);
    setPreviewDocKey(key);
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const categories = ['Semua', 'Web', 'Mobile & AI', 'AI & ML'];
  const filteredAcademicProjects =
    activeCategory === 'Semua'
      ? ACADEMIC_PROJECTS
      : ACADEMIC_PROJECTS.filter((p) => p.category === activeCategory);

  const row1Tech = TECH_STACK_ITEMS.slice(0, 9);
  const row2Tech = TECH_STACK_ITEMS.slice(9);

  return (
    <div id="top" className="min-h-screen bg-[#05070B] text-slate-100 relative pb-24 md:pb-0">
      {/* Intro Zipper & Split-Door Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Live Three.js 3D Wave Grid, Glowing Starfield & Architectural Spotlight */}
      <Scene3DBackground />

      {/* DESKTOP ONLY: Standard Floating Top Glass Navbar (hidden on mobile!) */}
      <header className="hidden md:block fixed top-0 inset-x-0 z-40 px-6 pt-4">
        <div className="max-w-6xl mx-auto rounded-full bg-[#0B0F19]/80 backdrop-blur-xl border border-white/[0.09] px-5 h-14 flex items-center justify-between shadow-[0_12px_34px_rgba(0,0,0,0.55)]">
          <a href="#top" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 via-slate-900 to-indigo-500/20 border border-sky-400/35 flex items-center justify-center text-sky-400 group-hover:border-sky-300 group-hover:text-sky-300 transition-all shadow-[0_0_18px_rgba(56,189,248,0.16)]">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-bold text-sm text-white tracking-tight">
                Bayu Saputra
              </span>
              <span className="font-mono text-[11px] text-sky-400">.dev</span>
            </div>
          </a>

          <nav className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.06]">
            {NAV_ITEMS.map(({ id, label, href, Icon }) => {
              const isActive = activeSection === id;
              return (
                <a
                  key={id}
                  href={href}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.1] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{label}</span>
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openDocPreview('cv')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-slate-200 text-xs font-medium transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Preview CV</span>
            </button>

            <a
              href="https://wa.me/6281228141650"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-semibold transition-all shadow-[0_0_20px_rgba(56,189,248,0.28)]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Hubungi</span>
            </a>
          </div>
        </div>
      </header>

      {/* MOBILE ONLY: Native App-Style Bottom Navigation Bar (hidden on desktop!) */}
      <nav
        aria-label="Navigasi Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#090D16]/95 backdrop-blur-2xl border-t border-white/[0.1] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.65)]"
      >
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {NAV_ITEMS.map(({ id, mobileLabel, href, Icon }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={id}
                href={href}
                className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors ${
                  isActive ? 'text-sky-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobileActivePill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-x-2 inset-y-0.5 rounded-xl bg-sky-400/12 border border-sky-400/25"
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-sky-400' : ''}`} />
                <span className="text-[10px] font-medium mt-1 relative z-10 leading-none">
                  {mobileLabel}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* MOBILE INLINE TOP HEADER (Scrolls away naturally, zero sticky top clutter on phone!) */}
        <div className="md:hidden flex items-center justify-between pt-4 pb-1">
          <a href="#top" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500/20 via-slate-900 to-indigo-500/20 border border-sky-400/35 flex items-center justify-center text-sky-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-bold text-sm text-white">Bayu Saputra</span>
              <span className="font-mono text-[11px] text-sky-400">.dev</span>
            </div>
          </a>

          <button
            onClick={() => openDocPreview('cv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs font-medium text-slate-200 active:scale-95 transition-transform"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Preview CV</span>
          </button>
        </div>

        {/* HERO SECTION + INTERACTIVE 3D LANYARD */}
        <section className="min-h-[calc(100vh-4rem)] md:min-h-screen pt-2 md:pt-24 pb-10 md:pb-12 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8">
          {/* Left Hero Column */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-6 space-y-5 sm:space-y-6 order-2 lg:order-1"
          >
            {/* Availability Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-sky-400/[0.08] border border-sky-400/20 text-[11px] sm:text-xs text-sky-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
              <span>Siap Berkontribusi · Web Developer / Software Engineer</span>
            </div>

            {/* Name & Animated Role Switcher */}
            <div className="space-y-2.5">
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Bayu Saputra
              </h1>

              <div className="h-7 sm:h-9 overflow-hidden flex items-center gap-2 text-base sm:text-2xl font-display font-semibold">
                <span className="text-slate-400 font-normal">Role:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROLES[roleIdx]}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent"
                  >
                    {ROLES[roleIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Bio Sesuai Profil Magang Hub */}
            <p className="text-xs sm:text-base text-slate-300/90 leading-relaxed max-w-xl">
              Lulusan D4 Teknik Informatika <strong className="text-white font-medium">Politeknik Caltex Riau</strong> dengan IPK <strong className="text-sky-300 font-medium">3.70/4.00</strong> yang berminat di pengembangan web dan aplikasi. Berpengalaman sebagai Web Developer Intern di <strong className="text-white font-medium">Balai Bahasa Provinsi Riau</strong> membangun website PPID, absensi tamu, dan survei kepuasan masyarakat, serta membangun sistem penerimaan santri baru pada Proyek Akhir. Menguasai <strong className="text-white font-medium">PHP, CodeIgniter, dan Laravel</strong>, serta memiliki dasar machine learning dan deep learning. Terbiasa bekerja dalam tim, aktif berorganisasi, dan cepat belajar.
            </p>

            {/* Primary CTA Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <a
                href="#proyek"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-white hover:bg-sky-50 text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-[0_0_25px_rgba(255,255,255,0.16)]"
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Lihat Karya</span>
              </a>

              <button
                onClick={() => openDocPreview('cv')}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-sky-400/15 hover:bg-sky-400/25 border border-sky-400/30 text-sky-200 text-xs sm:text-sm font-medium transition-colors"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Preview CV</span>
              </button>

              <a
                href="#kontak"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 text-xs sm:text-sm font-medium transition-colors"
              >
                <Mail className="w-4 h-4 text-sky-400" />
                <span>Kontak</span>
              </a>
            </div>

            {/* Social Media Quick Strip */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 mr-1">Sosial:</span>
              {SOCIAL_LINKS.map(({ name, url, accent, Icon }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  title={name}
                  className={`w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.09] flex items-center justify-center text-slate-300 transition-all ${accent}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Key Metrics Highlight Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.08] max-w-xl">
              <div className="p-2.5 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent border border-white/[0.05] sm:border-0">
                <p className="font-display text-base sm:text-xl font-bold text-white">3.70/4.00</p>
                <p className="text-[11px] text-slate-400 mt-0.5">IPK D4 TI PCR</p>
              </div>
              <div className="p-2.5 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent border border-white/[0.05] sm:border-0">
                <p className="font-display text-base sm:text-xl font-bold text-amber-300">Awardee</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Beasiswa Pemkab Rohil</p>
              </div>
              <div className="p-2.5 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent border border-white/[0.05] sm:border-0">
                <p className="font-display text-base sm:text-xl font-bold text-sky-400">BNSP</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Lulus Uji Programmer</p>
              </div>
              <div className="p-2.5 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent border border-white/[0.05] sm:border-0">
                <p className="font-display text-base sm:text-xl font-bold text-indigo-400">MTCNA</p>
                <p className="text-[11px] text-slate-400 mt-0.5">MikroTik 2024–2027</p>
              </div>
            </div>
          </motion.div>

          {/* Right Interactive 3D Physics Lanyard */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative flex flex-col items-center">
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-gradient-to-tr from-sky-500/15 to-indigo-500/15 blur-3xl" />

            <div className="w-full h-[390px] sm:h-[520px] lg:h-[620px] relative z-10">
              <LanyardScene
                isFlipped={isFlipped}
                onFlipToggle={() => setIsFlipped((f) => !f)}
                impulseKey={impulseKey}
              />
            </div>

            {/* Sleek Interactive Pill Controls Under Lanyard */}
            <div className="relative z-20 -mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs text-slate-300">
                <Hand className="w-3.5 h-3.5 text-sky-400" />
                <span>Tarik kartu</span>
              </span>

              <button
                onClick={() => setIsFlipped((f) => !f)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-[11px] sm:text-xs font-medium text-slate-200 transition-colors active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                <span>{isFlipped ? 'Depan' : 'Balik ID'}</span>
              </button>

              <button
                onClick={() => setImpulseKey((k) => k + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-[11px] sm:text-xs font-medium text-slate-200 transition-colors active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ayunkan</span>
              </button>
            </div>
          </div>
        </section>

        {/* DUAL-ROW INFINITE TECH STACK MARQUEE */}
        <motion.section
          id="keahlian"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-14 sm:py-16 border-t border-white/[0.06]"
        >
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Web Development · Mobile · Dasar ML &amp; DL</span>
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Teknologi &amp; Tools yang Digunakan
            </h2>
          </div>

          <div className="space-y-3.5 sm:space-y-4 overflow-hidden marquee-mask">
            {/* Row 1 -> Left */}
            <div className="flex w-max animate-marquee-left hover:[animation-play-state:paused] gap-3 sm:gap-4">
              {[...row1Tech, ...row1Tech].map((item, idx) => {
                const FallbackIcon = item.LucideIcon;
                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] hover:border-sky-400/35 transition-colors min-w-[185px] sm:min-w-[215px]"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.name} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                      ) : (
                        FallbackIcon && (
                          <FallbackIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.iconColor || 'text-sky-400'}`} />
                        )
                      )}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-xs sm:text-sm text-slate-100">{item.name}</p>
                      <p className="text-[11px] sm:text-xs text-slate-400">{item.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Row 2 -> Right */}
            <div className="flex w-max animate-marquee-right hover:[animation-play-state:paused] gap-3 sm:gap-4">
              {[...row2Tech, ...row2Tech].map((item, idx) => {
                const FallbackIcon = item.LucideIcon;
                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] hover:border-indigo-400/35 transition-colors min-w-[185px] sm:min-w-[215px]"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.name} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                      ) : (
                        FallbackIcon && (
                          <FallbackIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.iconColor || 'text-sky-400'}`} />
                        )
                      )}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-xs sm:text-sm text-slate-100">{item.name}</p>
                      <p className="text-[11px] sm:text-xs text-slate-400">{item.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* PART 1: REAL LIVE PRODUCTION SHOWCASE — BALAI BAHASA PROVINSI RIAU */}
        <motion.section
          id="proyek"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-16 sm:py-20 border-t border-white/[0.06]"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-xs font-medium text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Website Live · Pengalaman Magang</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Website Balai Bahasa Provinsi Riau
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Tiga website layanan publik (<strong className="text-slate-200 font-medium">PPID, SAPA, dan SKM</strong>) yang dikembangkan saat magang di Balai Bahasa Provinsi Riau (Kemendikdasmen) menggunakan Laravel &amp; Tailwind CSS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {LIVE_KEMENDIKDASMEN_PROJECTS.map((project) => (
              <SpotlightCard
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="cursor-pointer group flex flex-col justify-between"
              >
                <div className="p-4 sm:p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="rounded-2xl overflow-hidden bg-[#090C14] border border-white/[0.1] mb-4 sm:mb-5 shadow-lg">
                      <div className="px-3 py-2 bg-[#111624] border-b border-white/[0.07] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-400/75" />
                          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400/75" />
                          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400/75" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 truncate px-2 py-0.5 rounded bg-black/30 border border-white/[0.05]">
                          {project.displayUrl}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
                      </div>

                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="px-1 space-y-1.5 sm:space-y-2">
                      <p className="text-[11px] font-medium text-sky-400">{project.subtitle}</p>
                      <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {project.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-1 pt-4 mt-5 border-t border-white/[0.07] space-y-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-400/15 hover:bg-sky-400 text-sky-300 hover:text-slate-950 border border-sky-400/30 text-xs font-semibold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Kunjungi Website</span>
                      </a>

                      <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors inline-flex items-center gap-1">
                        Detail <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>

          {/* PART 2: PROYEK AKHIR & PROYEK MATA KULIAH */}
          <div className="mt-16 sm:mt-20 pt-14 sm:pt-16 border-t border-white/[0.06]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 sm:mb-10">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tugas Akhir &amp; Eksplorasi Perkuliahan</span>
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Proyek Akhir &amp; Proyek Mata Kuliah
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  Sistem yang dibangun sebagai Proyek Akhir kelulusan serta proyek mata kuliah (pengerjaan mandiri maupun tim).
                </p>
              </div>

              {/* Scrollable Category Filter Pills on Mobile */}
              <div className="flex overflow-x-auto max-w-full gap-1.5 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.08] self-start">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredAcademicProjects.map((project) => {
                const ProjectIcon = project.Icon;
                return (
                  <SpotlightCard
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="cursor-pointer group p-5 sm:p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 ${project.accent}`}
                        >
                          <ProjectIcon className="w-5 h-5" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.09] text-[10px] sm:text-[11px] font-medium text-slate-300">
                            {project.badge}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white/[0.05] group-hover:bg-sky-400 group-hover:text-slate-950 flex items-center justify-center text-slate-300 shrink-0 transition-all">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs font-medium text-sky-400 mb-1">{project.org}</p>
                      <h4 className="font-display text-base sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                        {project.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2">
                        {project.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-4 mt-5 border-t border-white/[0.07]">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[11px] text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* PENGALAMAN KERJA, PENCAPAIAN, PENDIDIKAN, SERTIFIKASI & PELATIHAN */}
        <motion.section
          id="pengalaman"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-16 sm:py-20 border-t border-white/[0.06]"
        >
          <div className="mb-8 sm:mb-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Pengalaman &amp; Latar Belakang</span>
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Pengalaman, Pencapaian &amp; Kredensial
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Left 7 Cols: Internship, Scholarship Achievement & Education */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* 1. Pengalaman Kerja */}
              <SpotlightCard className="p-5 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-sky-400/10 border border-sky-400/25 flex items-center justify-center text-sky-400 shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                        Web Developer Intern
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-sky-400">
                        Balai Bahasa Provinsi Riau — Kota Pekanbaru, Riau
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    Sep 2025 – Jan 2026
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Mengembangkan tiga website layanan untuk Balai Bahasa Provinsi Riau menggunakan{' '}
                  <strong className="text-slate-200">Laravel &amp; Tailwind CSS</strong>:
                </p>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed pt-4 border-t border-white/[0.07]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span>
                        <strong className="text-white">PPID (Layanan Informasi Publik):</strong>{' '}
                        Membangun website keterbukaan informasi publik dan pengajuan permohonan daring.
                      </span>{' '}
                      <a
                        href="https://ppidbbpriau.kemendikdasmen.go.id/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 underline underline-offset-4 ml-1 break-all"
                      >
                        ppidbbpriau.kemendikdasmen.go.id <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span>
                        <strong className="text-white">SAPA (Absensi Tamu Digital):</strong>{' '}
                        Mengembangkan website pencatatan kunjungan dan aspirasi layanan masyarakat.
                      </span>{' '}
                      <a
                        href="https://ppidbbpriau.kemendikdasmen.go.id/portal/tamu"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 underline underline-offset-4 ml-1"
                      >
                        /portal/tamu <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span>
                        <strong className="text-white">SKM (Survei Kepuasan Masyarakat):</strong>{' '}
                        Mengembangkan website survei kepuasan layanan sesuai PermenPANRB Nomor 14 Tahun 2017.
                      </span>{' '}
                      <a
                        href="https://ppidbbpriau.kemendikdasmen.go.id/portal/survei"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 underline underline-offset-4 ml-1"
                      >
                        /portal/survei <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>
                      Membantu pegawai sesuai kebutuhan sehari-hari di lingkungan kerja Balai Bahasa Provinsi Riau.
                    </span>
                  </li>
                </ul>

                <div className="pt-5 mt-5 border-t border-white/[0.07]">
                  <button
                    onClick={() => openDocPreview('magang')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-400/12 hover:bg-sky-400/20 border border-sky-400/30 text-xs font-medium text-sky-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Sertifikat Magang</span>
                  </button>
                </div>
              </SpotlightCard>

              {/* 2. Pencapaian / Beasiswa Resmi */}
              <SpotlightCard
                spotlightColor="rgba(251, 191, 36, 0.12)"
                className="p-5 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-300 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">Pencapaian</h3>
                      <p className="text-xs text-slate-400">Beasiswa Pendidikan</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-xs font-mono text-amber-300">
                    2022
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2">
                  <h4 className="font-display font-semibold text-sm sm:text-base text-white leading-snug">
                    Penerima Beasiswa Pendidikan Program Kerja Sama Pemerintah Kabupaten Rokan Hilir
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Lulus seleksi penerimaan mahasiswa baru jalur beasiswa pendidikan program kerja sama{' '}
                    <strong className="text-white font-medium">Pemerintah Kabupaten Rokan Hilir</strong> dengan{' '}
                    <strong className="text-white font-medium">Politeknik Caltex Riau</strong>{' '}
                    <span className="text-sky-300 font-mono text-[11px] sm:text-xs">(SK Direktur No. 0072/KEP-DIR/PCR/2022)</span>{' '}
                    untuk menempuh pendidikan D4 Teknik Informatika.
                  </p>
                </div>
              </SpotlightCard>

              {/* 3. Pendidikan Formal */}
              <SpotlightCard className="p-5 sm:p-8">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-400/10 border border-indigo-400/25 flex items-center justify-center text-indigo-400 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Pendidikan Formal</h3>
                    <p className="text-xs text-slate-400">Riwayat Akademik</p>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.07]">
                  <div className="pb-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-white">
                          Politeknik Caltex Riau — Kota Pekanbaru, Riau
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                          D4 Teknik Informatika ·{' '}
                          <span className="text-sky-400 font-semibold">IPK 3.70 / 4.00</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.07] self-start sm:self-center">
                        2022 – 2026
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-white">
                        Pondok Pesantren Bidayatul Hidayah — Rokan Hilir
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">SMA, Jurusan IPA</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.07] self-start sm:self-center">
                      2019 – 2022
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            </div>

            {/* Right 5 Cols: Certifications, Dicoding Trainings & Organizations */}
            <div className="lg:col-span-5 space-y-5 sm:space-y-6">
              {/* 1. Sertifikasi */}
              <SpotlightCard
                spotlightColor="rgba(129, 140, 248, 0.16)"
                className="p-5 sm:p-8"
              >
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-400/10 border border-sky-400/25 flex items-center justify-center text-sky-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Sertifikasi</h3>
                    <p className="text-xs text-slate-400">Kompetensi &amp; Jaringan</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* BNSP: Lulus, sertifikat sedang proses penerbitan */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-white">
                          Certificate of Competence – Programmer
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          LSP Politeknik Caltex Riau (BNSP)
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-400/15 text-emerald-300 text-[11px] font-medium shrink-0">
                        Lulus 2026
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-300/90 bg-amber-400/[0.08] border border-amber-400/20 rounded-lg px-2.5 py-1.5 inline-block">
                      Dinyatakan Kompeten / Lulus · Menunggu penerbitan sertifikat fisik
                    </p>
                  </div>

                  {/* MTCNA with Official Certificate Preview */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-white">
                          MikroTik Certified Network Associate (MTCNA)
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          MikroTik · ID: 2407NA0799
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-400/15 text-indigo-300 text-[11px] font-mono shrink-0">
                        2024–2027
                      </span>
                    </div>

                    <button
                      onClick={() => openDocPreview('mtcna')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-sky-300 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Sertifikat</span>
                    </button>
                  </div>
                </div>
              </SpotlightCard>

              {/* 2. Pelatihan (Dicoding Indonesia with Official Previews) */}
              <SpotlightCard className="p-5 sm:p-8">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Pelatihan</h3>
                    <p className="text-xs text-slate-400">Sertifikat Kelulusan Dicoding</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2.5">
                    <h4 className="font-semibold text-sm text-white leading-snug">
                      Prompt Engineering untuk Software Developer
                    </h4>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="text-emerald-300 font-medium">Dicoding Indonesia</span>
                      <span className="font-mono text-[11px]">Agu – Sep 2026</span>
                    </div>
                    <button
                      onClick={() => openDocPreview('promptEng')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-emerald-300 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Sertifikat</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2.5">
                    <h4 className="font-semibold text-sm text-white leading-snug">
                      Belajar Dasar AI
                    </h4>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="text-emerald-300 font-medium">Dicoding Indonesia</span>
                      <span className="font-mono text-[11px]">Agu – Sep 2026</span>
                    </div>
                    <button
                      onClick={() => openDocPreview('dasarAi')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-emerald-300 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Sertifikat</span>
                    </button>
                  </div>
                </div>
              </SpotlightCard>

              {/* 3. Organisasi */}
              <SpotlightCard className="p-5 sm:p-8">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-slate-200 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Organisasi</h3>
                    <p className="text-xs text-slate-400">Pengalaman Kepanitiaan &amp; Himpunan</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="pb-3.5 border-b border-white/[0.07]">
                    <p className="font-semibold text-white">
                      Information Technology Student Association (ITSA)
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Anggota Himpunan Mahasiswa (Agu 2023 – Agu 2026)
                    </p>
                  </div>
                  <div className="pb-3.5 border-b border-white/[0.07]">
                    <p className="font-semibold text-white">UKM PCR-Rohil</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Anggota Divisi Pendidikan &amp; Kaderisasi; Koordinator Dokumentasi (Sharing Session 5) &amp; Koordinator Perlengkapan (2nd Anniversary PCR-Rohil) (Nov 2022 – Jul 2023)
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Unit Kegiatan Mahasiswa Islam (UKMI)</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Anggota Divisi Konsumsi Muktamar XXII (Juli 2024)
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </motion.section>

        {/* CONTACT & SOCIAL MEDIA SECTION */}
        <motion.section
          id="kontak"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-16 sm:py-20 border-t border-white/[0.06]"
        >
          <SpotlightCard className="p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hubungi &amp; Media Sosial</span>
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                  Siap Berkontribusi sebagai Web Developer / Software Engineer.
                </h2>
                <p className="text-xs sm:text-base text-slate-400 leading-relaxed">
                  Terbiasa bekerja dalam tim, aktif berorganisasi, dan cepat belajar. Silakan hubungi saya melalui kontak langsung maupun media sosial berikut.
                </p>
                <div className="flex items-start gap-2 text-xs text-slate-400 pt-1">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Kota Pekanbaru &amp; Jl. Lintas Bagansiapiapi, Rokan Hilir, Riau</span>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                {/* Direct Email & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={copyEmail}
                    className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] flex items-center justify-between gap-3 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/25 flex items-center justify-center text-sky-400 shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400">Email (Klik salin)</p>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {email}
                        </p>
                      </div>
                    </div>
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
                    )}
                  </button>

                  <a
                    href="https://wa.me/6281228141650"
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] flex items-center justify-between gap-3 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">WhatsApp</p>
                        <p className="text-xs sm:text-sm font-semibold text-white">0812-2814-1650</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
                  </a>
                </div>

                {/* All 5 Social Media Cards */}
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-400 mb-2.5">Media Sosial Resmi</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SOCIAL_LINKS.map(({ name, handle, url, accent, Icon }) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] flex items-center gap-2.5 text-slate-300 transition-all ${accent}`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white leading-tight">{name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{handle}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.section>
      </main>

      {/* Project Lightbox Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0D111A] border border-white/15 p-5 sm:p-7 space-y-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-sky-400">{selectedProject.org}</p>
                  <h3 className="font-display text-lg sm:text-2xl font-bold text-white mt-0.5">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedProject.image && (
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              )}

              <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
                {selectedProject.details}
              </p>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                {selectedProject.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-medium text-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {selectedProject.url && (
                <div className="pt-2">
                  <a
                    href={selectedProject.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs sm:text-sm font-semibold transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka {selectedProject.displayUrl}</span>
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Read-Only Document & Certificate Preview Modal (Works identically on HP & Desktop!) */}
      <AnimatePresence>
        {activePreviewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewDocKey(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
              className="w-full max-w-4xl h-[88vh] rounded-t-3xl sm:rounded-3xl bg-[#0D111A] border border-white/15 flex flex-col overflow-hidden shadow-2xl select-none"
            >
              {/* Modal Top Toolbar */}
              <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0B0F19]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-sky-400/10 border border-sky-400/25 flex items-center justify-center text-sky-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xs sm:text-base font-bold text-white truncate">
                      {activePreviewDoc.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                      {activePreviewDoc.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                    aria-label="Perkecil"
                    className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-300 px-1 hidden sm:inline">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.75, +(z + 0.25).toFixed(2)))}
                    aria-label="Perbesar"
                    className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {activePreviewDoc.verifyUrl && (
                    <a
                      href={activePreviewDoc.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-400/15 hover:bg-sky-400/25 border border-sky-400/30 text-xs font-medium text-sky-300 ml-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{activePreviewDoc.verifyLabel}</span>
                    </a>
                  )}

                  <button
                    onClick={() => setPreviewDocKey(null)}
                    aria-label="Tutup"
                    className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white transition-colors ml-1"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Read-Only High-DPI Document Pages */}
              <div className="flex-1 overflow-auto bg-[#07090E] p-3 sm:p-6">
                <div
                  className="mx-auto space-y-4 transition-all duration-150 origin-top"
                  style={{ maxWidth: `${Math.round(780 * zoomLevel)}px` }}
                >
                  {activePreviewDoc.pages.map((src, idx) => (
                    <div
                      key={src}
                      className="rounded-xl overflow-hidden border border-white/10 shadow-xl bg-white"
                    >
                      <img
                        src={src}
                        alt={`${activePreviewDoc.title} - Halaman ${idx + 1}`}
                        draggable={false}
                        className="w-full h-auto block pointer-events-none select-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Independent Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Bayu Saputra Portfolio</span>

          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ name, url, Icon }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
