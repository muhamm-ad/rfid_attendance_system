"use client";

import { Person } from "@/types";
import {
  DataTableDeleteDialog,
  type DataTableDeleteDialogMessages,
} from "@/components/data-table";

const messages: DataTableDeleteDialogMessages<Person> = {
  title: "Delete Person",
  description: (row) => (
    <p className="mb-2">
      Are you sure you want to delete{" "}
      <span className="font-bold">({row.id})</span>?
      <br />
      This action will permanently remove the person with the type of{" "}
      <span className="font-bold">{row.type.toUpperCase()}</span> from the
      system. This cannot be undone.
    </p>
  ),
  idLabel: "Person ID:",
  idPlaceholder: "Enter person ID to confirm deletion.",
  toast: {
    loading: (id: string) => `Deleting person ${id}...`,
    success: (id: string) => `Deleted person ${id}`,
    error: (id: string) => `Error deleting person ${id}`,
  },
};

export function PersonsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Person;
  onSuccess?: () => void;
}) {
  const handleDelete = async () => {
    const res = await fetch(`/api/persons/${currentRow.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to delete person");
    onSuccess?.();
  };

  return (
    <DataTableDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      currentRow={currentRow}
      getRowId={(row) => row.id.toString()}
      handleDelete={handleDelete}
      messages={messages}
    />
  );
}
