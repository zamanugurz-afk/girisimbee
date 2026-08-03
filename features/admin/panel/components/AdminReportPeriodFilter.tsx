'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMIN_REPORT_PERIOD_LABELS,
  ADMIN_REPORT_PERIODS,
} from '@/features/admin/panel/constants/admin-reports.constants';
import type { AdminReportPeriod } from '@/features/admin/panel/types/admin-panel.types';

export function AdminReportPeriodFilter({
  value,
  onChange,
}: {
  value: AdminReportPeriod;
  onChange: (period: AdminReportPeriod) => void;
}) {
  return (
    <div className="w-[180px]">
      <Select
        value={value}
        onValueChange={(next) => onChange(next as AdminReportPeriod)}
      >
        <SelectTrigger aria-label="Rapor dönemi">
          <SelectValue placeholder="Dönem" />
        </SelectTrigger>
        <SelectContent>
          {ADMIN_REPORT_PERIODS.map((period) => (
            <SelectItem key={period} value={period}>
              {ADMIN_REPORT_PERIOD_LABELS[period]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
