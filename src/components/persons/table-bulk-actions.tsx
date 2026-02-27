import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import {
  DataTableDeleteDialog,
  type DataTableDeleteDialogMessages,
} from "@/components/data-table";

export function PersonsTableBulkActions<TData extends { id: number }>({
  table,
  onSuccess,
}: {
  table: Table<TData>;
  onSuccess?: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  // ─── Bulk delete ──────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    const ids = selectedRows.map((row) => row.original.id);
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/persons/${id}`, { method: "DELETE" }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error ?? `Failed to delete person ${id}`);
          }
        }),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      throw new Error(`Failed to delete ${failed.length} of ${ids.length} persons`);
    }
    onSuccess?.();
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="person">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected persons"
            >
              <Trash2 />
              <span className="sr-only">Delete selected persons</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete selected persons</TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <DataTableDeleteDialog
        mode="multi"
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
        handleDelete={handleBulkDelete}
        messages={
          {
            title: (count: number) =>
              `Delete ${count} ${count > 1 ? "persons" : "person"}`,
            description:
              "Are you sure you want to delete the selected persons? This action cannot be undone.",
            toast: {
              loading: "Deleting persons...",
              success: (count: number) =>
                `Deleted ${count} person${count > 1 ? "s" : ""}`,
              error: "Error deleting persons",
            },
          } as DataTableDeleteDialogMessages<TData>
        }
      />
    </>
  );
}
