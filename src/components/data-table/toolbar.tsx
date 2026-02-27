// @/components/data-table/toolbar.tsx

import { Cross2Icon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./faceted-filter";
import { DataTableViewOptions } from "./view-options";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  globalFilterValue?: string;
  searchPlaceholder?: string;
  searchKey?: string;
  onRefresh?: () => void;
  refreshTitle?: string;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
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
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    (globalFilterValue !== undefined ? !!globalFilterValue : !!stateGlobalFilter);

  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
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
        <div className="flex gap-x-2">
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter("");
            }}
            className="h-8 px-1 lg:px-3 border"
          >
            Reset
            <Cross2Icon className=" h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
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
