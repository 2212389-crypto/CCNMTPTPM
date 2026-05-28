import React from 'react';
import type { SortOrder } from '@/types';

export type Column<T extends Record<string, unknown>> = {
  key: keyof T & string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

type PaginationCtl = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (p: number) => void;
};

type Props<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSortChange?: (key: string, order: SortOrder) => void;
  pagination?: PaginationCtl;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyText = 'Không có dữ liệu',
  sortBy,
  sortOrder = 'asc',
  onSortChange,
  pagination
}: Props<T>) {
  const flip = (k: string) => {
    if (!onSortChange) return;
    const next = sortBy === k && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(k, next);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-3 py-2 text-left ${c.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
                onClick={c.sortable ? () => flip(c.key) : undefined}
                role={c.sortable ? 'button' : undefined}
                tabIndex={c.sortable ? 0 : undefined}
                onKeyDown={c.sortable ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    flip(c.key);
                  }
                } : undefined}
              >
                <div className="flex items-center gap-1">
                  {c.header}
                  {c.sortable && sortBy === c.key && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-3 py-8 text-center text-gray-500" colSpan={columns.length}>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Đang tải…
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className="px-3 py-8 text-center text-gray-500" colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={('id' in row && row.id) ? String(row.id) : i} className="border-t hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-3">
                    {c.render ? c.render(row) : String(row[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="flex items-center justify-between py-3 border-t">
          <div className="text-sm text-gray-700">
            Hiển thị {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} kết quả
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Trang trước"
            >
              « Trước
            </button>
            <span className="text-sm text-gray-700">
              Trang {pagination.page} / {Math.max(1, Math.ceil(pagination.total / pagination.limit))}
            </span>
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              aria-label="Trang sau"
            >
              Sau »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
