import { type ColumnDef } from "@tanstack/react-table";
import { LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/cn-utils";
import { actionColors, typeColors } from "@/lib/ui-utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { AttendanceLog } from "@/types";

export const attendancesColumns: ColumnDef<AttendanceLog>[] = [
  // ─── Attendance ID ────────────────────────────────────────────────────────────
  // {
  //   accessorKey: "id",
  //   enableHiding: false,
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="ID" />
  //   ),
  //   cell: ({ row }) => (
  //     // <span className="font-mono text-sm text-muted-foreground">
  //     <span className="text-sm theme-text-muted font-mono">
  //       {row.getValue("id")}
  //     </span>
  //   ),
  // },

  // ─── Timestamp ─────────────────────────────────────────────────────────────
  {
    accessorKey: "timestamp",
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => (
      <span className="text-sm theme-text-muted">
        {new Date(row.getValue<string>("timestamp")).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })}
      </span>
    ),
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.timestamp).getTime() -
      new Date(rowB.original.timestamp).getTime(),
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
        <div className="flex items-center justify-end w-16">
          <UserAvatar src={photo} name={name} />
        </div>
      );
    },
  },

  // ─── First name ─────────────────────────────────────────────────────────────
  {
    accessorKey: "first_name",
    enableHiding: false,
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
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => (
      <LongText className="cell-person-name">{row.original.last_name}</LongText>
    ),
  },

  // ─── Person ID ─────────────────────────────────────────────────────────────
  // {
  //   accessorKey: "person_id",
  //   enableHiding: false,
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Person ID" />
  //   ),
  //   cell: ({ row }) => (
  //     // <span className="font-mono text-sm text-muted-foreground">
  //     <span className="text-sm theme-text-muted font-mono">
  //       {row.getValue("person_id")}
  //     </span>
  //   ),
  // },

  // ─── RFID UUID ─────────────────────────────────────────────────────────────
  {
    accessorKey: "rfid_uuid",
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

  // ─── Type ──────────────────────────────────────────────────────────────────
  {
    accessorKey: "type",
    enableSorting: true,
    id: "type",
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

  // ─── Action ────────────────────────────────────────────────────────────────
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      const action = row.getValue<string>("action");
      const Icon = action === "in" ? LogIn : LogOut;
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5",
            actionColors[action as keyof typeof actionColors] ??
              "theme-badge-muted",
          )}
        >
          <Icon size={12} className="shrink-0" />
          <span className="capitalize">{action}</span>
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },

  // ─── Status ────────────────────────────────────────────────────────────────
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return (
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            status === "success" ? "theme-badge-success" : "theme-badge-error",
          )}
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
];
