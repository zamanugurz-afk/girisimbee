'use client';

import { useTheme } from 'next-themes';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { useMemo } from 'react';
import { formatTry, formatDate } from '@/lib/utils';

function useChartColors() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return {
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    axis: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    primary: isDark ? 'hsl(213 94% 60%)' : 'hsl(217 91% 50%)',
    success: isDark ? 'hsl(142 64% 50%)' : 'hsl(142 71% 42%)',
    warning: isDark ? 'hsl(36 92% 58%)' : 'hsl(32 95% 48%)',
    danger: isDark ? 'hsl(0 72% 62%)' : 'hsl(0 84% 56%)',
    accent: isDark ? 'hsl(199 80% 56%)' : 'hsl(199 89% 42%)',
    tooltipBg: isDark ? 'hsl(222 20% 12%)' : 'hsl(0 0% 100%)',
    tooltipBorder: isDark ? 'hsl(222 14% 20%)' : 'hsl(215 25% 91%)',
    tooltipText: isDark ? 'hsl(210 16% 96%)' : 'hsl(222 22% 11%)',
  };
}

function ChartTooltip({ active, payload, label, valueFormatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-pop">
      {label && (
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      )}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

interface PriceTrendChartProps {
  data: { date: string; median: number; min: number; max: number }[];
  height?: number;
}

export function PriceTrendChart({ data, height = 260 }: PriceTrendChartProps) {
  const c = useChartColors();
  const formatted = useMemo(
    () => data.map((d) => ({ ...d, label: formatDate(d.date) })),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gMedian" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.primary} stopOpacity={0.25} />
            <stop offset="100%" stopColor={c.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gRange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.accent} stopOpacity={0.18} />
            <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: c.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tick={{ fill: c.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip
          content={<ChartTooltip valueFormatter={(v: number) => formatTry(v)} />}
        />
        <Area
          type="monotone"
          dataKey="max"
          name="Max"
          stroke={c.accent}
          strokeWidth={1}
          fill="url(#gRange)"
          strokeDasharray="4 3"
          isAnimationActive
          animationDuration={700}
        />
        <Area
          type="monotone"
          dataKey="median"
          name="Median"
          stroke={c.primary}
          strokeWidth={2}
          fill="url(#gMedian)"
          isAnimationActive
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BarSeriesChartProps {
  data: { name: string; value: number }[];
  height?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  valueFormatter?: (v: number) => string;
}

export function BarSeriesChart({
  data,
  height = 260,
  color = 'primary',
  valueFormatter,
}: BarSeriesChartProps) {
  const c = useChartColors();
  const fill = c[color];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: c.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: c.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ fill: c.grid }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Bar
          dataKey="value"
          name="Value"
          fill={fill}
          radius={[6, 6, 0, 0]}
          isAnimationActive
          animationDuration={700}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  colors?: string[];
}

export function DonutChart({ data, height = 240, colors }: DonutChartProps) {
  const c = useChartColors();
  const palette = colors ?? [c.primary, c.success, c.warning, c.danger, c.accent];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="62%"
          outerRadius="100%"
          paddingAngle={2}
          strokeWidth={0}
          isAnimationActive
          animationDuration={700}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
