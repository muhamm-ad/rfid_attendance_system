// @/components/data-table/delete-dialog.tsx

"use client";

import { type ReactNode, useState } from "react";
import { type Table } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";

// ─── Messages ────────────────────────────────────────────────────────

export type DataTableDeleteDialogMessages<TData = unknown> = {
  title: string | ((count: number) => string);
  description: ((row: TData) => ReactNode) | ReactNode;
  idLabel?: string;
  idPlaceholder?: string;
  toast: {
    loading: string | ((id: string) => string);
    success: ((id: string) => string) | ((count: number) => string);
    error: string | ((id: string) => string);
  };
};

// ─── Props ───────────────────────────────────

type BaseProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleDelete?: () => Promise<void>;
  messages: DataTableDeleteDialogMessages<TData>;
};

type SingleModeProps<TData> = {
  mode?: "single";
  currentRow: TData;
  getRowId: (row: TData) => string;
  table?: never;
};

type MultiModeProps<TData> = {
  mode: "multi";
  table: Table<TData>;
  currentRow?: never;
  getRowId?: never;
};

export type DataTableDeleteDialogProps<TData> = BaseProps<TData> &
  (SingleModeProps<TData> | MultiModeProps<TData>);

// ─── Internal implementations ─────────────────────────────────────────────────

function SingleDeleteImpl<TData>({
  open,
  onOpenChange,
  currentRow,
  getRowId,
  handleDelete,
  messages,
}: BaseProps<TData> & SingleModeProps<TData>) {
  const [value, setValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const rowId = getRowId(currentRow);

  const title =
    typeof messages.title === "string" ? messages.title : messages.title(1);
  const description =
    typeof messages.description === "function"
      ? (messages.description as (row: TData) => ReactNode)(currentRow)
      : messages.description;

  const localHandleDelete = () => {
    if (value.trim() !== rowId || !handleDelete) return;

    setIsDeleting(true);
    toast.promise(
      handleDelete().finally(() => setIsDeleting(false)),
      {
        loading:
          typeof messages.toast.loading === "function"
            ? messages.toast.loading(rowId)
            : messages.toast.loading,
        success: () => {
          setValue("");
          onOpenChange(false);
          return (messages.toast.success as (id: string) => string)(rowId);
        },
        error: (err: unknown) =>
          err instanceof Error
            ? err.message
            : typeof messages.toast.error === "function"
              ? messages.toast.error(rowId)
              : messages.toast.error,
      },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={localHandleDelete}
      disabled={value.trim() !== rowId || isDeleting}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{" "}
          {title}
        </span>
      }
      desc={
        <div className="space-y-4">
          {description}
          <Label className="my-2">
            {messages.idLabel ?? "ID:"}
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                messages.idPlaceholder ?? "Enter ID to confirm deletion."
              }
            />
          </Label>
          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  );
}

const CONFIRM_WORD = "DELETE";

function MultiDeleteImpl<TData>({
  open,
  onOpenChange,
  table,
  handleDelete,
  messages,
}: BaseProps<TData> & MultiModeProps<TData>) {
  const [value, setValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;

  const title =
    typeof messages.title === "function"
      ? messages.title(count)
      : messages.title;
  const description =
    typeof messages.description !== "function" ? messages.description : null;

  const localHandleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }
    if (!handleDelete) return;

    setIsDeleting(true);
    toast.promise(
      handleDelete().finally(() => setIsDeleting(false)),
      {
        loading:
          typeof messages.toast.loading === "string"
            ? messages.toast.loading
            : messages.toast.loading(""),
        success: () => {
          setValue("");
          onOpenChange(false);
          table.resetRowSelection();
          return (messages.toast.success as (count: number) => string)(count);
        },
        error: (err: unknown) =>
          err instanceof Error
            ? err.message
            : typeof messages.toast.error === "string"
              ? messages.toast.error
              : messages.toast.error(""),
      },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={localHandleDelete}
      disabled={value.trim() !== CONFIRM_WORD || isDeleting}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{" "}
          {title}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">{description}</p>
          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Confirm by typing &quot;{CONFIRM_WORD}&quot;:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
            />
          </Label>
          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function DataTableDeleteDialog<TData>(
  props: DataTableDeleteDialogProps<TData>,
) {
  if (props.mode === "multi") {
    return (
      <MultiDeleteImpl<TData>
        {...(props as BaseProps<TData> & MultiModeProps<TData>)}
      />
    );
  }
  return (
    <SingleDeleteImpl<TData>
      {...(props as BaseProps<TData> & SingleModeProps<TData>)}
    />
  );
}
