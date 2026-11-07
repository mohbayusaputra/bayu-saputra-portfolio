import React, { useEffect, useState } from 'react';
import { BarChart3, Calendar, Clock, Users } from 'lucide-react';

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
 * Panel Statistik Pengunjung Responsif (Hari Ini, Bulan Ini, Total).
 * Dihitung unik per browser dan tampil proporsional di layar ponsel maupun desktop.
 */
export default function VisitorStats() {
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

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
        if (!res.ok) {
          if (!cancelled) setFailed(true);
          return;
        }
        const data = await res.json();
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              day: data.dayKey || day,
              month: data.monthKey || month,
              total: true,
            })
          );
        } catch {}
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    const timer = window.setTimeout(load, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (failed) return null;

  const items = [
    {
      label: 'Hari Ini',
      value: stats ? formatNumber(stats.today) : '—',
      Icon: Clock,
      iconTone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
      valueTone: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Bulan Ini',
      value: stats ? formatNumber(stats.month) : '—',
      Icon: Calendar,
      iconTone: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      valueTone: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Total',
      value: stats ? formatNumber(stats.total) : '—',
      Icon: Users,
      iconTone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      valueTone: 'text-sky-600 dark:text-sky-300',
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-white/90 dark:bg-[#0D111A]/90 border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_34px_-12px_rgba(0,0,0,0.55)] transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Statistik Pengunjung
          </h3>
        </div>

        {/* Right 3 Responsive Metric Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
          {items.map(({ label, value, Icon, iconTone, valueTone }) => (
            <div
              key={label}
              className="rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col justify-between min-w-0 sm:min-w-[124px]"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {label}
                </span>
                <span
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border flex items-center justify-center shrink-0 ${iconTone}`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
              </div>
              <p
                className={`font-display text-base sm:text-xl font-bold tabular-nums tracking-tight truncate ${valueTone}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
