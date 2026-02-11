// @/components/shared/data-table.tsx
// Data table built with TanStack Table + shadcn Table (see https://ui.shadcn.com/docs/components/radix/data-table)

"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const DEFAULT_TABLE_HEADER_CLASSNAME =
  "text-center font-medium text-gray-500 cursor-pointer hover:bg-gray-100";

export const DEFAULT_TABLE_CELL_CLASSNAME =
  "text-center whitespace-nowrap items-center justify-center";

export type { ColumnDef };

/** Use column meta to pass cell/header classNames: meta: { cellClassName?: string; headerClassName?: string } */
export interface DataTableColumnMeta {
  cellClassName?: string;
  headerClassName?: string;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  pageSize?: number;
  /** Initial sort: [{ id: columnId, desc: boolean }] */
  initialSorting?: SortingState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No results.",
  pageSize = 25,
  initialSorting = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: { pageIndex: 0, pageSize },
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50 [&_tr]:border-b-0">
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

      {table.getFilteredRowModel().rows.length > pageSize && (
        <div className="flex items-center justify-end space-x-2">
          emptyMessage
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
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
