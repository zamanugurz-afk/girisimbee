import { AdminMetricCard } from '@/features/admin/panel/components/AdminMetricCard';
import type { AdminSupportStats as AdminSupportStatsData } from '@/features/admin/panel/types/admin-panel.types';

export function AdminSupportStats({ stats }: { stats: AdminSupportStatsData }) {
  const cards = [
    { id: 'open', label: 'Açık talepler', value: stats.open_count },
    { id: 'waiting', label: 'Bekleyen talepler', value: stats.waiting_count },
    { id: 'resolved', label: 'Çözülen talepler', value: stats.resolved_count },
    {
      id: 'avg',
      label: 'Ortalama yanıt süresi',
      value: `${stats.avg_response_minutes} dk`,
    },
    {
      id: 'ops',
      label: 'Operatör performansı',
      value: stats.operator_performance,
    },
    {
      id: 'daily',
      label: 'Günlük toplam talep sayısı',
      value: stats.daily_ticket_count,
    },
  ];

  return (
    <section aria-label="Destek metrikleri" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <AdminMetricCard key={card.id} label={card.label} value={card.value} />
      ))}
    </section>
  );
}
