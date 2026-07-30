'use client';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Row,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
  loadingRows?: number;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  emptyState,
  loading,
  loadingRows = 6,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = loading ? Array.from({ length: loadingRows }) : table.getRowModel().rows;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    className="border-b border-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortDir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : sortDir === 'desc' ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40 group-hover:opacity-70" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {loading
              ? (rows as number[]).map((_, i) => (
                  <tr key={`s-${i}`}>
                    {columns.map((_, c) => (
                      <td key={c} className="border-b border-border px-3 py-3.5">
                        <div className="h-4 animate-pulse rounded bg-muted/60" style={{ width: `${60 + ((i + c) % 5) * 8}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row, i) => {
                  const r = row as Row<T>;
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      onClick={() => onRowClick?.(r.original)}
                      className={cn(
                        'group cursor-default transition-colors',
                        onRowClick && 'cursor-pointer hover:bg-muted/50',
                      )}
                    >
                      {r.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="border-b border-border px-3 py-3.5 text-foreground"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
          </AnimatePresence>
        </tbody>
      </table>
      {!loading && data.length === 0 && emptyState}
    </div>
  );
}
