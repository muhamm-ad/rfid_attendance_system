import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/cn-utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/user-avatar";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { User, UserRoleEnum } from "@/types";
import { UsersTableRowActions } from "@/components/users/table-row-actions";

// Role metadata: icon + badge colour
export const roleConfig: Record<
  string,
  { icon: React.ElementType; className: string }
> = {
  [UserRoleEnum.SUPER_ADMIN]: {
    icon: ShieldCheck,
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  },
  [UserRoleEnum.ADMIN]: {
    icon: ShieldCheck,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  },
  [UserRoleEnum.CASHIER]: {
    icon: Shield,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  },
  [UserRoleEnum.MANAGER]: {
    icon: Eye,
    className:
      "border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
  },
};

export const usersColumns: ColumnDef<User>[] = [
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
        disabled={row.original.role === "SUPER_ADMIN"}
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
      const { first_name, last_name, image } = row.original;
      const name = [first_name, last_name].filter(Boolean).join(" ") || "?";
      return (
        <div className="flex items-center justify-end w-16">
          <UserAvatar src={image} name={name} />
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

  // ─── Email ─────────────────────────────────────────────────────────────────
  {
    accessorKey: "email",
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-sm theme-text-muted">{row.getValue("email")}</span>
    ),
  },

  // ─── Role ──────────────────────────────────────────────────────────────────
  {
    accessorKey: "role",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue<string>("role");
      const config = roleConfig[role];
      const Icon = config?.icon ?? ShieldOff;
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 capitalize",
            config?.className ?? "theme-badge-muted",
          )}
        >
          <Icon size={12} />
          {role.toLowerCase()}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },

  // ─── Status (is_active) ────────────────────────────────────────────────────
  {
    accessorKey: "is_active",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>("is_active");
      return (
        <Badge
          variant="outline"
          className={
            isActive
              ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
              : "border-gray-200 bg-gray-50 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue<boolean>(id) ? "true" : "false"),
  },

  // ─── Created at ────────────────────────────────────────────────────────────
  {
    accessorKey: "createdAt",
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <span className="text-sm theme-text-muted">
        {new Date(row.getValue<string>("createdAt")).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          },
        )}
      </span>
    ),
  },

  // ─── Row actions ───────────────────────────────────────────────────────────
  {
    id: "actions",
    enableHiding: false,
    cell: UsersTableRowActions,
  },
];
