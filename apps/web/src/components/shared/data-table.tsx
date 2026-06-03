'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
}

export function DataTable<T>({ columns, data, searchPlaceholder = 'Search...', onSearch, actions }: DataTableProps<T>) {
  return (
    <div className="card w-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))] w-4 h-4" />
          <input
            type="text"
            className="input pl-9"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
              {columns.map((col, index) => (
                <th key={index} className="p-4 font-medium text-[hsl(var(--text-secondary))] whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))] transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-4 align-middle">
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-[hsl(var(--text-muted))]">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Static UI for now) */}
      <div className="flex items-center justify-between p-4 border-t border-[hsl(var(--border))] text-sm">
        <div className="text-[hsl(var(--text-muted))]">
          Showing <strong>1</strong> to <strong>{data.length}</strong> of <strong>{data.length}</strong> results
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" disabled>
            <ChevronLeft size={16} /> Previous
          </button>
          <button className="btn btn-secondary btn-sm" disabled>
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
