// src/features/admin/components/common/UserDataTable.tsx
"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, MoreHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableColumn<T> {
  key: keyof T | "actions";
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface UserDataTableProps<T extends { id: string }> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onRowSelect?: (rowIds: string[]) => void;
  onRowAction?: (action: "edit" | "suspend" | "delete", row: T) => void;
  onExport?: () => void;
  emptyMessage?: string;
  actionsColumn?: boolean;
  className?: string;
}

export function UserDataTable<T extends { id: string; status?: string }>({
  columns,
  data,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onSort,
  onRowSelect,
  onRowAction,
  onExport,
  emptyMessage = "No users found",
  actionsColumn = true,
  className,
}: UserDataTableProps<T>) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: string) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleSelectAll = (checked: boolean) => {
    const allIds = data.map((row) => row.id);
    onRowSelect?.(checked ? allIds : []);
  };

  const handleSelectRow = (checked: boolean, rowId: string) => {
    const currentSelection = onRowSelect?.([]) || [];
    const newSelection = checked
      ? [...currentSelection, rowId]
      : currentSelection.filter((id) => id !== rowId);
    onRowSelect?.(newSelection);
  };

  if (isLoading) {
    return <DataTableSkeleton columns={columns.length} rows={pageSize} />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
          {isRtl && emptyMessage === "No users found" ? "لم يتم العثور على مستخدمين" : emptyMessage}
        </p>
      </div>
    );
  }

  const startIdx = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800",
        className,
        isRtl ? "font-tajawal" : ""
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-start">
          {isRtl
            ? `عرض ${startIdx} - ${endIdx} من ${totalCount} مستخدم`
            : `Showing ${startIdx} - ${endIdx} of ${totalCount} users`}
        </div>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="transition-colors w-full sm:w-auto"
          >
            <Download className="w-4 h-4 me-2" />
            {isRtl ? 'تصدير CSV' : 'Export CSV'}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
              {actionsColumn && onRowSelect && (
                <TableHead className="w-12 p-4 text-start">
                  <Checkbox
                    checked={data.length > 0 && data.every((row) => true)}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    "p-4 text-start whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200",
                    column.sortable &&
                    "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  )}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="text-gray-400 dark:text-gray-500">
                        {sortConfig?.key === String(column.key) &&
                          sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : sortConfig?.key === String(column.key) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {actionsColumn && (
                <TableHead className="w-12 p-4 text-end whitespace-nowrap">
                  {isRtl ? 'إجراءات' : 'Actions'}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  "border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                )}
              >
                {actionsColumn && onRowSelect && (
                  <TableCell className="p-4 text-start">
                    <Checkbox
                      checked={true}
                      onCheckedChange={(checked) =>
                        handleSelectRow(checked as boolean, row.id)
                      }
                      aria-label={`Select ${row.id}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className="p-4 text-sm text-start">
                    {column.render ? column.render(row) : String(row[column.key as keyof typeof row])}
                  </TableCell>
                ))}
                {actionsColumn && (
                  <TableCell className="p-4 text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label="Open user actions menu"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onRowAction?.("edit", row)}
                        >
                          {isRtl ? 'تعديل' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRowAction?.("suspend", row)}
                        >
                          {row.status === "active" ? (isRtl ? 'إيقاف' : 'Suspend') : (isRtl ? 'تفعيل' : 'Activate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                          onClick={() => onRowAction?.("delete", row)}
                        >
                          {isRtl ? 'حذف' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={() => { }}
        isRtl={isRtl}
      />
    </div>
  );
}

// Skeleton Component
function DataTableSkeleton({
  columns,
  rows = 10,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <Skeleton className="h-4 w-48" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i} className="p-4 text-start">
                <Skeleton className="h-4 w-32" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: columns + 1 }).map((_, j) => (
                <TableCell key={j} className="p-4">
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isRtl,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isRtl?: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
      <div className="text-sm text-gray-600 dark:text-gray-400 shrink-0">
        {isRtl ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="transition-colors w-full sm:w-auto"
        >
          {isRtl ? 'السابق' : 'Previous'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="transition-colors w-full sm:w-auto"
        >
          {isRtl ? 'التالي' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
