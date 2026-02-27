import { useEffect, useState } from "react";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/cn-utils";
import { type NavigateFn, useTableUrlState } from "@/hooks/use-table-url-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_PAGE_SIZE,
  TABLE_HEADER_CLASSNAME,
  TABLE_CELL_CLASSNAME,
} from "@/lib/ui-utils";
import { DataTablePagination, DataTableToolbar } from "@/components/data-table";
import { Person, PersonTypeEnum } from "@/types";
import { PersonsTableBulkActions } from "@/components/persons/table-bulk-actions";
import { personsColumns as columns } from "@/components/persons/table-columns";

type DataTableProps = {
  data: Person[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
  onRefresh?: () => void;
  className?: string;
};

export function PersonsTable({
  data,
  search,
  navigate,
  onRefresh,
  className,
}: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (keys/defaults mirror persons route search schema)
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: DEFAULT_PAGE_SIZE },
    globalFilter: { enabled: true, key: "filter" },
    columnFilters: [{ columnId: "type", searchKey: "type", type: "array" }],
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row: Person) => String(row.id),
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    ensurePageInRange(table.getPageCount());
  }, [table, ensurePageInRange]);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col h-full w-full gap-4",
        className,
      )}
    >
      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        globalFilterValue={globalFilter ?? ""}
        searchPlaceholder="Filter by name, RFID..."
        onRefresh={onRefresh}
        refreshTitle="Refresh persons"
        filters={[
          {
            columnId: "type",
            title: "Type",
            options: Object.values(PersonTypeEnum).map((t) => ({
              label: t.charAt(0).toUpperCase() + t.slice(1),
              value: t,
            })),
          },
        ]}
      />

      {/* Table container */}
      <div className={cn("flex flex-col min-h-0 flex-1 overflow-hidden")}>
        <div className="overflow-x-auto rounded-lg border theme-border bg-background">
          <Table className="min-w-full [&_tr]:border-b theme-border">
            <TableHeader className="bg-background [&_tr]:border-b theme-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        TABLE_HEADER_CLASSNAME,
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName,
                      )}
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
            <TableBody className="theme-table-body">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b theme-border theme-table-row-hover"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          TABLE_CELL_CLASSNAME,
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName,
                        )}
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
                    No persons found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {data.length > 0 && (
          <div className="mt-auto pt-3">
            <DataTablePagination
              table={table}
              pageIndex={pagination.pageIndex}
            />
          </div>
        )}
      </div>

      {/* Bulk actions */}
      <PersonsTableBulkActions table={table} onSuccess={onRefresh} />
    </div>
  );
}
