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
import { CalendarArrowDown, CalendarArrowUp, CheckCircle2, LogIn, LogOut, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/cn-utils";
import { actionColors, typeColors } from "@/lib/ui-utils";
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
import { AttendanceLog, PersonTypeEnum } from "@/types";
import { attendancesColumns as columns } from "@/components/attendances/table-columns";

type DataTableProps = {
  data: AttendanceLog[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
  onRefresh?: () => void;
  className?: string;
};

export function AttendancesTable({
  data,
  search,
  navigate,
  onRefresh,
  className,
}: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);

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
      { columnId: "type", searchKey: "type", type: "array" },
      { columnId: "status", searchKey: "status", type: "array" },
      { columnId: "action", searchKey: "action", type: "array" },
    ],
  });

  // Date range: managed as extra URL params outside useTableUrlState
  const startDate = (search.startDate as string) ?? "";
  const endDate = (search.endDate as string) ?? "";

  function setStartDate(val: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        startDate: val || undefined,
        page: undefined,
      }),
    });
  }

  function setEndDate(val: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        endDate: val || undefined,
        page: undefined,
      }),
    });
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row: AttendanceLog) => String(row.id),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onPaginationChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
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
    <div className={cn("flex flex-1 flex-col h-full w-full gap-2", className)}>
      {/* Main toolbar: search + faceted filters + datetime filters + refresh + view options */}
      <DataTableToolbar
        table={table}
        globalFilterValue={globalFilter ?? ""}
        searchPlaceholder="Filter by name, RFID..."
        onRefresh={onRefresh}
        refreshTitle="Refresh attendance logs"
        filters={[
          {
            columnId: "type",
            title: "Type",
            options: Object.values(PersonTypeEnum).map((t) => ({
              label: t.charAt(0).toUpperCase() + t.slice(1),
              value: t,
              className:
                typeColors[t as keyof typeof typeColors] ?? "theme-badge-muted",
            })),
          },
          {
            columnId: "status",
            title: "Status",
            options: [
              {
                label: "Success",
                value: "success",
                icon: CheckCircle2,
                className: "theme-badge-success",
              },
              {
                label: "Failed",
                value: "failed",
                icon: XCircle,
                className: "theme-badge-error",
              },
            ],
          },
          {
            columnId: "action",
            title: "Action",
            options: [
              {
                label: "Entry (In)",
                value: "in",
                icon: LogIn,
                className: actionColors.in,
              },
              {
                label: "Exit (Out)",
                value: "out",
                icon: LogOut,
                className: actionColors.out,
              },
            ],
          },
          {
            type: "datetime" as const,
            title: "Start date",
            value: startDate ? new Date(startDate) : null,
            onChange: (date: Date | null) =>
              setStartDate(date ? format(date, "yyyy-MM-dd'T'HH:mm") : ""),
            placeholder: "Start date & time",
            icon: <CalendarArrowUp />,
          },
          {
            type: "datetime" as const,
            title: "End date",
            value: endDate ? new Date(endDate) : null,
            onChange: (date: Date | null) =>
              setEndDate(date ? format(date, "yyyy-MM-dd'T'HH:mm") : ""),
            placeholder: "End date & time",
            icon: <CalendarArrowDown />,
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
                    No attendance records found
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
    </div>
  );
}
