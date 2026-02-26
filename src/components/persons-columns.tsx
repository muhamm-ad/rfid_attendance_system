import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/cn-utils";
import { typeColors } from "@/lib/ui-utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/user-avatar";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { Person } from "@/types";
import { PersonsTableRowActions } from "@/components/persons-table-row-actions";

export const personsColumns: ColumnDef<Person>[] = [
  // ─── Select ────────────────────────────────────────────────────────────────
  {
    id: "select",
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
    enableSorting: false,
    enableHiding: false,
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.getValue("id")}
      </span>
    ),
  },

  // ─── Full name ─────────────────────────────────────────────────────────────
  {
    id: "fullName",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const { first_name, last_name } = row.original;
      return (
        <LongText className="max-w-40">{`${first_name} ${last_name}`}</LongText>
      );
    },
    meta: { className: "w-40" },
  },

  // ─── Type ──────────────────────────────────────────────────────────────────
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue<string>("type");
      return (
        <Badge
          variant="outline"
          className={cn("capitalize", typeColors[type as keyof typeof typeColors])}
        >
          {type}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },

  // ─── RFID UUID ─────────────────────────────────────────────────────────────
  {
    accessorKey: "rfid_uuid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RFID UUID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.getValue("rfid_uuid")}
      </span>
    ),
  },

  // ─── Updated at ────────────────────────────────────────────────────────────
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Modified" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.getValue<string>("updated_at")).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    ),
  },

  // ─── Row actions ───────────────────────────────────────────────────────────
  {
    id: "actions",
    cell: PersonsTableRowActions,
  },
];
