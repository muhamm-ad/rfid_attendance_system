import { useState } from "react";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    );

  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(
    () => Object.fromEntries(columns.map((col) => [col.id, col.getIsVisible()])),
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ms-auto hidden h-8 lg:flex"
        >
          <MixerHorizontalIcon className="size-4" />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[170px] p-2">
        <p className="px-2 py-1 text-sm font-medium">Toggle columns</p>
        <Separator className="my-1" />
        <div className="space-y-0.5">
          {columns.map((column) => {
            const isVisible = visibilityMap[column.id] ?? true;
            return (
              <div
                key={column.id}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                onClick={() => {
                  const newVisible = !isVisible;
                  column.toggleVisibility(newVisible);
                  setVisibilityMap((prev) => ({
                    ...prev,
                    [column.id]: newVisible,
                  }));
                }}
              >
                <Checkbox
                  id={column.id}
                  checked={isVisible}
                  tabIndex={-1}
                  className="pointer-events-none"
                />
                <Label
                  htmlFor={column.id}
                  className="capitalize cursor-pointer text-sm font-normal flex-1 pointer-events-none"
                >
                  {column.id}
                </Label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
