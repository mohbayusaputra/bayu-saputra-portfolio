import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

const STORAGE_KEY = 'bs-visitor';

function jakartaParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const month = `${get('year')}-${get('month')}`;
  return { day: `${month}-${get('day')}`, month };
}

function readSeen() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n);

/**
 * Statistik pengunjung unik per browser (hari ini, bulan ini, total).
 * Dimuat setelah halaman selesai tampil agar tidak memengaruhi performa awal.
 * Disembunyikan otomatis bila layanan statistik tidak tersedia.
 */
export default function VisitorStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { day, month } = jakartaParts();
      const seen = readSeen();
      const payload = {
        day: seen.day !== day,
        month: seen.month !== month,
        total: !seen.total,
      };

      try {
        const res = await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        const data = await res.json();
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ day: data.dayKey || day, month: data.monthKey || month, total: true })
          );
        } catch {}
        if (!cancelled) setStats(data);
      } catch {}
    };

    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(load, { timeout: 3000 });
      } else {
        load();
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!stats) return null;

  const items = [
    { label: 'Hari ini', value: stats.today },
    { label: 'Bulan ini', value: stats.month },
    { label: 'Total', value: stats.total },
  ];

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] text-[11px] text-slate-500 dark:text-slate-400">
      <BarChart3 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
      <span className="hidden sm:inline">Pengunjung</span>
      {items.map(({ label, value }, idx) => (
        <span key={label} className="inline-flex items-center gap-1">
          {idx > 0 && <span className="text-slate-300 dark:text-white/15 mr-1">·</span>}
          <span>{label}</span>
          <strong className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {formatNumber(value)}
          </strong>
        </span>
      ))}
    </div>
  );
}
