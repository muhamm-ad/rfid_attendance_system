// @/components/ui/data-table.tsx

"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/cn-utils";

export const DEFAULT_TABLE_HEADER_CLASSNAME =
  "text-center font-medium text-gray-500 cursor-pointer hover:bg-gray-100";

export const DEFAULT_TABLE_CELL_CLASSNAME =
  "text-center whitespace-nowrap items-center justify-center";

export type { ColumnDef };

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200, 500];

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  pageSize?: number;
  /** Initial sort: [{ id: columnId, desc: boolean }] */
  initialSorting?: SortingState;
  /** Rows per page options. Default [10, 25, 50, 100, 200, 500] */
  pageSizeOptions?: number[];
  /** Called when user changes rows per page (e.g. to sync with parent state) */
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No results.",
  pageSize = 25,
  initialSorting = [],
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageSize, pageIndex: 0 }));
  }, [pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
  });

  const handlePageSizeChange = (value: string) => {
    const size = Number(value);
    table.setPageSize(size);
    onPageSizeChange?.(size);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y theme-border [&_tr]:border-b theme-border">
          <TableHeader className="theme-table-header [&_tr]:border-b theme-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={DEFAULT_TABLE_HEADER_CLASSNAME}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="theme-table-row border-b theme-border hover:bg-[var(--surface-muted)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={DEFAULT_TABLE_CELL_CLASSNAME}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <DataTablePaginationControls
          table={table}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}

function DataTablePaginationControls<TData>({
  table,
  pageSizeOptions,
  onPageSizeChange,
}: {
  table: import("@tanstack/react-table").Table<TData>;
  pageSizeOptions: number[];
  onPageSizeChange: (value: string) => void;
}) {
  const pageCount = table.getPageCount();
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;

  if (pageCount <= 1 && pageSize === table.getRowCount()) return null;

  return (
    <div className="flex items-center justify-center px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground text-sm font-medium">
            Rows per page
          </p>
          <select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(e.target.value)}
            className={cn(
              "theme-border bg-[var(--surface)] h-8 w-[70px] rounded-md border px-2 text-sm theme-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 focus:ring-offset-2 focus:border-[var(--brand)]"
            )}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            {!pageSizeOptions.includes(pageSize) && (
              <option value={pageSize}>{pageSize}</option>
            )}
          </select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium theme-text-muted">
          Page {pageIndex + 1} of {pageCount || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPrev}
          >
            <span className="sr-only">First page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!canPrev}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!canNext}
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!canNext}
          >
            <span className="sr-only">Last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Sortable column header button. Use in column header: header: ({ column }) => <DataTableColumnHeader column={column} title="Label" /> */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: import("@tanstack/react-table").Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>;
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      // className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
