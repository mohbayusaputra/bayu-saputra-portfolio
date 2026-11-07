// Endpoint statistik pengunjung (hari ini, bulan ini, total) berbasis Upstash Redis.
// Pengunjung dihitung unik per browser: browser mengirim penanda mana saja yang belum
// tercatat (hari / bulan / total), sehingga refresh di browser yang sama tidak menambah hitungan.

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const PREFIX = 'bs-portofolio:visitors';

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

async function redisPipeline(commands) {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(503).json({ error: 'Penyimpanan statistik belum dikonfigurasi' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const { day, month } = jakartaParts();
  const dayKey = `${PREFIX}:day:${day}`;
  const monthKey = `${PREFIX}:month:${month}`;
  const totalKey = `${PREFIX}:total`;

  let body = {};
  if (req.method === 'POST') {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  }
  const countDay = body.day === true;
  const countMonth = body.month === true;
  const countTotal = body.total === true;

  const commands = [
    countDay ? ['INCR', dayKey] : ['GET', dayKey],
    countMonth ? ['INCR', monthKey] : ['GET', monthKey],
    countTotal ? ['INCR', totalKey] : ['GET', totalKey],
  ];
  // Hapus otomatis data harian & bulanan lama agar database tetap kecil
  if (countDay) commands.push(['EXPIRE', dayKey, 60 * 60 * 24 * 3]);
  if (countMonth) commands.push(['EXPIRE', monthKey, 60 * 60 * 24 * 40]);

  try {
    const results = await redisPipeline(commands);
    const toNum = (r) => Number(r?.result) || 0;
    return res.status(200).json({
      today: toNum(results[0]),
      month: toNum(results[1]),
      total: toNum(results[2]),
      dayKey: day,
      monthKey: month,
    });
  } catch {
    return res.status(502).json({ error: 'Gagal mengambil statistik pengunjung' });
  }
}
