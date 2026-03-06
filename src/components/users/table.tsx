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
import { User, UserRoleEnum } from "@/types";
import { UserTableBulkActions } from "@/components/users/table-bulk-actions";
import {
  usersColumns as columns,
  roleConfig,
} from "@/components/users/table-columns";

type DataTableProps = {
  data: User[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
  onRefresh?: () => void;
  className?: string;
};

export function UsersTable({
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

  // Synced with URL states (keys/defaults mirror users route search schema)
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
    columnFilters: [
      { columnId: "is_active", searchKey: "is_active", type: "array" },
      { columnId: "role", searchKey: "role", type: "array" },
    ],
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row: User) => row.id,
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
        "flex flex-1 flex-col h-full w-full gap-2",
        className,
      )}
    >
      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        globalFilterValue={globalFilter ?? ""}
        searchPlaceholder="Filter by name, email..."
        onRefresh={onRefresh}
        refreshTitle="Refresh users"
        filters={[
          {
            columnId: "is_active",
            title: "Status",
            options: [
              {
                label: "Active",
                value: "true",
                className:
                  "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
              },
              {
                label: "Inactive",
                value: "false",
                className:
                  "border-gray-200 bg-gray-50 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400",
              },
            ],
          },
          {
            columnId: "role",
            title: "Role",
            options: Object.values(UserRoleEnum)
              .filter((role) => role !== "SUPER_ADMIN")
              .map((role) => ({
                label: role.charAt(0) + role.slice(1).toLowerCase(),
                value: role,
                className: roleConfig[role]?.className ?? "theme-badge-muted",
              })),
          },
        ]}
      />

      {/* Table container */}
      <div className={cn("flex flex-col min-h-0 flex-1 overflow-hidden")}>
        <div className="overflow-x-auto no-scrollbar rounded-lg border theme-border bg-background">
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
                    No users found
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
      <UserTableBulkActions table={table} onSuccess={onRefresh} />
    </div>
  );
}
