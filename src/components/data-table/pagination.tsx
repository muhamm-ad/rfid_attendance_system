// @/components/data-table/pagination.tsx

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { cn } from "@/lib/cn-utils";
import { Button } from "@/components/ui/button";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  pageIndex?: number;
  className?: string;
};

export function DataTablePagination<TData>({
  table,
  pageIndex: pageIndexProp,
  className,
}: DataTablePaginationProps<TData>) {
  const statePagination = table.getState().pagination;
  const pageIndex =
    pageIndexProp !== undefined ? pageIndexProp : statePagination.pageIndex;
  const pageSize = statePagination.pageSize;
  const pageCount = table.getPageCount();
  const rowCount = table.getRowCount();

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < Math.max(0, pageCount - 1);

  if (pageCount <= 1 && pageSize >= rowCount) return null;

  return (
    <div className={cn("flex items-center justify-center px-2 pb-0", className)}>
      <div className="flex items-center space-x-6 lg:space-x-8">
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
