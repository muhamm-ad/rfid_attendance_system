import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2, UserX, UserCheck, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import { User } from "@/types";
import {
  DataTableDeleteDialog,
  type DataTableDeleteDialogMessages,
} from "@/components/data-table";

function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function UserTableBulkActions<TData extends { id: string }>({
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
    const ids = selectedRows
      .filter((row) => (row.original as unknown as { role: string }).role !== "SUPER_ADMIN")
      .map((row) => row.original.id);
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/users/${id}`, { method: "DELETE" }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error ?? `Failed to delete user ${id}`);
          }
        }),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      throw new Error(`Failed to delete ${failed.length} of ${ids.length} users`);
    }
    onSuccess?.();
  };

  // ─── Bulk status change (TODO: implement API) ─────────────────────────────
  const handleBulkStatusChange = (status: "active" | "inactive") => {
    const selectedUsers = selectedRows.map((row) => row.original as unknown as User);
    // TODO: Replace sleep with real API call to PATCH /api/users (bulk status update)
    toast.promise(sleep(2000), {
      loading: `${status === "active" ? "Activating" : "Deactivating"} users...`,
      success: () => {
        table.resetRowSelection();
        return `${status === "active" ? "Activated" : "Deactivated"} ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`;
      },
      error: `Error ${status === "active" ? "activating" : "deactivating"} users`,
    });
  };

  // ─── Bulk invite (TODO: implement API) ───────────────────────────────────
  const handleBulkInvite = () => {
    const selectedUsers = selectedRows.map((row) => row.original as unknown as User);
    // TODO: Replace sleep with real API call to POST /api/users/invite (bulk invite)
    toast.promise(sleep(2000), {
      loading: "Inviting users...",
      success: () => {
        table.resetRowSelection();
        return `Invited ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`;
      },
      error: "Error inviting users",
    });
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="user">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkInvite}
              className="size-8"
              aria-label="Invite selected users"
            >
              <Mail />
              <span className="sr-only">Invite selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Invite selected users</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange("active")}
              className="size-8"
              aria-label="Activate selected users"
            >
              <UserCheck />
              <span className="sr-only">Activate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Activate selected users</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange("inactive")}
              className="size-8"
              aria-label="Deactivate selected users"
            >
              <UserX />
              <span className="sr-only">Deactivate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Deactivate selected users</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected users"
            >
              <Trash2 />
              <span className="sr-only">Delete selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete selected users</TooltipContent>
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
              `Delete ${count} ${count > 1 ? "users" : "user"}`,
            description:
              "Are you sure you want to delete the selected users? This action cannot be undone.",
            toast: {
              loading: "Deleting users...",
              success: (count: number) =>
                `Deleted ${count} user${count > 1 ? "s" : ""}`,
              error: "Error deleting users",
            },
          } as DataTableDeleteDialogMessages<TData>
        }
      />
    </>
  );
}
