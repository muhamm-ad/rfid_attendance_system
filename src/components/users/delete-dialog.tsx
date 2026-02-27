"use client";

import { User } from "@/types";
import {
  DataTableDeleteDialog,
  type DataTableDeleteDialogMessages,
} from "@/components/data-table";

const messages: DataTableDeleteDialogMessages<User> = {
  title: "Delete User",
  description: (row) => (
    <p className="mb-2">
      Are you sure you want to delete{" "}
      <span className="font-bold">({row.id})</span>?
      <br />
      This action will permanently remove the user with the role of{" "}
      <span className="font-bold">{row.role.toUpperCase()}</span> from the
      system. This cannot be undone.
    </p>
  ),
  idLabel: "User ID:",
  idPlaceholder: "Enter user ID to confirm deletion.",
  toast: {
    loading: (id: string) => `Deleting user ${id}...`,
    success: (id: string) => `Deleted user ${id}`,
    error: (id: string) => `Error deleting user ${id}`,
  },
};

type UsersDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: User;
  onSuccess?: () => void;
};

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: UsersDeleteDialogProps) {
  const handleDelete = async () => {
    const res = await fetch(`/api/users/${currentRow.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to delete user");
    onSuccess?.();
  };

  return (
    <DataTableDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      currentRow={currentRow}
      getRowId={(row) => row.id}
      handleDelete={handleDelete}
      messages={messages}
    />
  );
}
