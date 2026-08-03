'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminOverviewChartSeries } from '@/features/admin/panel/types/admin-overview.types';
import { cn } from '@/lib/utils';

export function AdminOverviewCharts({
  charts,
}: {
  charts: AdminOverviewChartSeries[];
}) {
  return (
    <section
      aria-label="Trend grafikleri"
      className="grid gap-4 xl:grid-cols-3"
    >
      {charts.map((chart) => (
        <article
          key={chart.id}
          className={cn(
            'rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200',
            'hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md',
            'dark:border-white/10 dark:bg-card/90',
          )}
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">{chart.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{chart.description}</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`fill-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.color} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={chart.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={chart.dataKey}
                  stroke={chart.color}
                  strokeWidth={2}
                  fill={`url(#fill-${chart.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      ))}
    </section>
  );
}
