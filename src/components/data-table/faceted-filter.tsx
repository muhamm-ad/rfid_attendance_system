// @/components/data-table/faceted-filter.tsx

import * as React from "react";
import { useState } from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { type Column } from "@tanstack/react-table";
import { cn } from "@/lib/cn-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
  }[];
};

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-0 border-dashed p-0 overflow-hidden",
            isOpen && "bg-accent text-accent-foreground",
          )}
        >
          {/* Label zone — always has a muted background */}
          <span className="flex h-full items-center gap-1.5 bg-muted px-3 text-muted-foreground">
            <PlusCircledIcon className="size-4 shrink-0" />
            {title}
          </span>

          {/* Badge zone — only shown when something is selected */}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <span className="flex items-center gap-1 px-2">
                <Badge
                  variant="brand"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedValues.size}
                </Badge>
                <span className="hidden space-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="brand"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="outline"
                          key={option.value}
                          className={cn(
                            "rounded-sm px-1 font-normal",
                            option.className ?? "theme-badge-brand",
                          )}
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </span>
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      );
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4 text-background")} />
                    </div>
                    {option.icon && (
                      <option.icon className="size-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
