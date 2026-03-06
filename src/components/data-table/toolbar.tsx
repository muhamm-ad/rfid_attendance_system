// @/components/data-table/toolbar.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";
import { RefreshCw, CalendarArrowUp, CalendarArrowDown } from "lucide-react";
import { cn } from "@/lib/cn-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatetimePicker } from "@/components/date-time-picker";
import { DataTableFacetedFilter } from "@/components/data-table/faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/view-options";

type FacetedFilterConfig = {
  type?: "faceted";
  columnId: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
  }[];
};

type DatetimeFilterConfig = {
  type: "datetime";
  title: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
};

export type FilterConfig = FacetedFilterConfig | DatetimeFilterConfig;

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  globalFilterValue?: string;
  searchPlaceholder?: string;
  searchKey?: string;
  onRefresh?: () => void;
  refreshTitle?: string;
  filters?: FilterConfig[];
};

export function DataTableToolbar<TData>({
  table,
  globalFilterValue,
  searchPlaceholder = "Filter...",
  searchKey,
  onRefresh,
  refreshTitle = "Refresh",
  filters = [],
}: DataTableToolbarProps<TData>) {
  const stateGlobalFilter = table.getState().globalFilter ?? "";
  const searchInputValue =
    globalFilterValue !== undefined ? globalFilterValue : stateGlobalFilter;

  const datetimeFilters = filters.filter(
    (f): f is DatetimeFilterConfig => f.type === "datetime",
  );

  const columnFiltersLength = table.getState().columnFilters.length;

  const isFiltered =
    columnFiltersLength > 0 ||
    (globalFilterValue !== undefined
      ? !!globalFilterValue
      : !!stateGlobalFilter) ||
    datetimeFilters.some((f) => f.value !== null);

  const filtersRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Detect whether the filter strip overflows
  useEffect(() => {
    const el = filtersRef.current;
    if (!el) return;
    const check = () => setIsScrollable(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll to the end whenever an active filter changes
  useEffect(() => {
    const el = filtersRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  }, [columnFiltersLength, isFiltered]);

  return (
    <div className="flex items-center gap-2 p-2">
      {/* Search — fixed width, never shrinks away */}
      <div className="shrink-0">
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        ) : (
          <Input
            placeholder={searchPlaceholder}
            value={searchInputValue}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
      </div>

      {/* Filters — takes all remaining space, scrolls horizontally */}
      <div
        ref={filtersRef}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar rounded-md px-1 transition-colors duration-300",
          isScrollable && "bg-accent",
        )}
      >
        {filters.map((filter, i) => {
          if (filter.type === "datetime") {
            return (
              <DatetimePicker
                key={filter.title}
                value={filter.value}
                onChange={filter.onChange}
                label={filter.title}
                placeholder={filter.placeholder ?? filter.title}
                icon={
                  filter.value ? <CalendarArrowUp /> : <CalendarArrowDown />
                }
              />
            );
          }
          const column = table.getColumn(filter.columnId);
          if (!column) return null;
          return (
            <DataTableFacetedFilter
              key={filter.columnId ?? i}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          );
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter("");
              datetimeFilters.forEach((f) => f.onChange(null));
            }}
            className="h-8 shrink-0 px-1 lg:px-3 border"
          >
            Reset
            <Cross2Icon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Actions — fixed, always visible on the right */}
      <div className="flex shrink-0 items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            name={refreshTitle}
            title={refreshTitle}
            className="h-8 gap-2"
          >
            <RefreshCw size={16} />
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
