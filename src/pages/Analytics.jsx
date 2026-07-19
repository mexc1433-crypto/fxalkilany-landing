import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowRight, MousePointerClick, Timer, Users } from 'lucide-react';

export default function Analytics() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.entities.PageVisit.list('-created_date', 1000)
      .then((rows) => setVisits(rows))
      .catch((e) => setError(e?.message || 'تعذّر تحميل البيانات'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = visits.length;
    const clicks = visits.filter((v) => v.clicked).length;
    const totalDuration = visits.reduce(
      (sum, v) => sum + (v.duration_seconds || 0),
      0
    );
    const avg = total ? Math.round(totalDuration / total) : 0;
    const conversion = total ? Math.round((clicks / total) * 100) : 0;
    return { total, clicks, avg, totalDuration, conversion };
  }, [visits]);

  const fmtTime = (s) => {
    if (!s) return '0 ثانية';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m > 0) return `${m} د ${sec} ث`;
    return `${sec} ثانية`;
  };

  const cards = [
    {
      label: 'عدد الزوّار',
      value: stats.total,
      icon: Users,
      color: '#00F3FF',
    },
    {
      label: 'عدد النقرات',
      value: stats.clicks,
      icon: MousePointerClick,
      color: '#FFD700',
    },
    {
      label: 'متوسط مدة البقاء',
      value: fmtTime(stats.avg),
      icon: Timer,
      color: '#FF00E5',
    },
    {
      label: 'نسبة التحويل',
      value: `${stats.conversion}%`,
      icon: ArrowRight,
      color: '#22C55E',
    },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full"
      style={{ background: '#05070A', color: '#FFFFFF' }}
    >
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold md:text-3xl">
              تحليلات صفحة الهبوط
            </h1>
            <p className="mt-1 font-mono text-sm text-white/40">
              FX ALKILANY — إحصائيات الزيارات والنقرات
            </p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-[#00F3FF]/40 px-4 py-2 font-mono text-xs text-[#00F3FF] hover:bg-[#00F3FF]/10"
          >
            الصفحة الرئيسية
          </Link>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#00F3FF]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {cards.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    style={{ boxShadow: `0 0 30px ${c.color}15` }}
                  >
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: `${c.color}15`, color: c.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="font-heading text-3xl font-bold">
                      {c.value}
                    </div>
                    <div className="mt-1 font-mono text-xs text-white/50">
                      {c.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h2 className="mb-4 font-heading text-lg font-bold">
                إجمالي وقت البقاء:{' '}
                <span className="text-[#00F3FF]">
                  {fmtTime(stats.totalDuration)}
                </span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-right font-mono text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="py-2 pr-3">الزيارة</th>
                      <th className="py-2 pr-3">المدة</th>
                      <th className="py-2 pr-3">نقر؟</th>
                      <th className="py-2 pr-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.slice(0, 50).map((v, i) => (
                      <tr
                        key={v.id}
                        className="border-b border-white/5 hover:bg-white/[0.03]"
                      >
                        <td className="py-2 pr-3 text-white/70">#{i + 1}</td>
                        <td className="py-2 pr-3 text-[#00F3FF]">
                          {fmtTime(v.duration_seconds || 0)}
                        </td>
                        <td className="py-2 pr-3">
                          {v.clicked ? (
                            <span className="text-[#FFD700]">نعم</span>
                          ) : (
                            <span className="text-white/30">لا</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-white/40">
                          {v.created_date
                            ? new Date(v.created_date).toLocaleString('ar-EG')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}