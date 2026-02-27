import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/cn-utils";
import { typeColors } from "@/lib/ui-utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/user-avatar";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { Person, PersonWithPayments } from "@/types";
import { PersonsTableRowActions } from "@/components/persons/table-row-actions";

export const personsColumns: ColumnDef<Person>[] = [
  // ─── Select ────────────────────────────────────────────────────────────────
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    meta: {
      className: cn("max-md:sticky start-0 z-10 rounded-tl-[inherit]"),
    },
  },

  // ─── Avatar ────────────────────────────────────────────────────────────────
  {
    id: "avatar",
    enableSorting: false,
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => {
      const { first_name, last_name, photo } = row.original;
      const name = `${first_name} ${last_name}`;
      return (
        <div className="flex justify-center">
          <UserAvatar src={photo} name={name} />
        </div>
      );
    },
  },

  // ─── ID ────────────────────────────────────────────────────────────────────
  {
    accessorKey: "id",
    enableSorting: true,
    enableHiding: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      // <span className="font-mono text-sm text-muted-foreground">
      <span className="text-sm theme-text-muted font-mono">
        {row.getValue("id")}
      </span>
    ),
  },

  // ─── RFID UUID ─────────────────────────────────────────────────────────────
  {
    accessorKey: "rfid_uuid",
    enableSorting: true,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RFID UUID" />
    ),
    cell: ({ row }) => (
      // <span className="font-mono text-sm text-muted-foreground">
      <span className="text-sm theme-text-muted font-mono">
        {row.getValue("rfid_uuid")}
      </span>
    ),
  },

  // ─── First name ─────────────────────────────────────────────────────────────
  {
    accessorKey: "first_name",
    enableSorting: true,
    enableHiding: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => (
      <LongText className="cell-person-name">
        {row.original.first_name}
      </LongText>
    ),
  },

  // ─── Last name ───────────────────────────────────────────────────────────────
  {
    accessorKey: "last_name",
    enableSorting: true,
    enableHiding: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => (
      <LongText className="cell-person-name">{row.original.last_name}</LongText>
    ),
  },

  // ─── Type ──────────────────────────────────────────────────────────────────
  {
    accessorKey: "type",
    enableSorting: true,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue<string>("type");
      return (
        <Badge
          variant="outline"
          className={cn(
            typeColors[type as keyof typeof typeColors] ?? "theme-badge-muted",
          )}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },

  // ─── Payment status ──────────────────────────────────────────────────────────
  {
    accessorKey: "payment_status",
    enableSorting: false,
    enableHiding: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ row }) => {
      const person = row.original as PersonWithPayments;
      return (
        <div>
          {person.type === "student" ? (
            <div className="flex gap-2 text-xs justify-center">
              <span
                className={
                  person.trimester1_paid ? "font-medium" : "font-medium"
                }
                style={{
                  color: person.trimester1_paid
                    ? "var(--success)"
                    : "var(--error)",
                }}
              >
                T1: {person.trimester1_paid ? "✓" : "✗"}
              </span>
              <span
                className={
                  person.trimester2_paid
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                T2: {person.trimester2_paid ? "✓" : "✗"}
              </span>
              <span
                className="font-medium"
                style={{
                  color: person.trimester3_paid
                    ? "var(--success)"
                    : "var(--error)",
                }}
              >
                T3: {person.trimester3_paid ? "✓" : "✗"}
              </span>
            </div>
          ) : (
            <span className="theme-text-muted">N/A</span>
          )}
        </div>
      );
    },
  },

  // ─── Updated at ────────────────────────────────────────────────────────────
  {
    accessorKey: "updated_at",
    enableSorting: true,
    enableHiding: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Modified" />
    ),
    cell: ({ row }) => (
      // <span className="text-sm text-muted-foreground">
      <span className="text-sm theme-text-muted">
        {new Date(row.getValue<string>("updated_at")).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        )}
      </span>
    ),
  },

  // ─── Row actions ───────────────────────────────────────────────────────────
  {
    enableSorting: false,
    enableHiding: false,
    id: "actions",
    cell: PersonsTableRowActions,
  },
];
