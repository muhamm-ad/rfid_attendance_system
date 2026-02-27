import { type NavigateFn } from "@/hooks/use-table-url-state";
import { UsersDialogs } from "@/components/users/dialogs";
import { UsersProvider } from "@/components/providers/users-provider";
import { UsersTable } from "@/components/users/table";
import { User } from "@/types";
import { MailPlus, RefreshCw, UserPlus, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/use-users";

export function UsersPrimaryButtons({
  onRefresh,
}: {
  onRefresh?: () => void;
}) {
  const { setOpen } = useUsers();
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setOpen("invite")}
      >
        <MailPlus size={20} />
        Invite User
      </Button>
      <Button className="gap-2" onClick={() => setOpen("add")}>
        <UserPlus size={20} />
        Add User
      </Button>
      {onRefresh && (
        <Button
          onClick={onRefresh}
          className="gap-2"
          title="Refresh users"
        >
          <RefreshCw size={20} />
          Refresh
        </Button>
      )}
    </div>
  );
}

export function Users({
  data,
  search,
  navigate,
  variant = "default",
  onRefresh,
  error,
}: {
  data: User[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
  variant?: "default" | "page";
  onRefresh?: () => void;
  error?: string | null;
}) {
  if (variant === "page") {
    return (
      <UsersProvider>
        <div className="page-container h-full">
          <header className="page-header">
            <div className="page-title-group">
              <h1 className="page-title">
                <UsersIcon size={28} className="page-title-icon" aria-hidden />
                User Management
              </h1>
              <p className="page-subtitle">
                Manage users, roles, and access
              </p>
            </div>
            <div className="page-actions">
              <UsersPrimaryButtons onRefresh={onRefresh} />
            </div>
          </header>
          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}
          <div className="relative flex-1 h-full w-full">
            <UsersTable
              data={data}
              search={search}
              navigate={navigate}
              onRefresh={onRefresh}
            />
          </div>
          <UsersDialogs />
        </div>
      </UsersProvider>
    );
  }

  return (
    <UsersProvider>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User List</h2>
          <p className="text-muted-foreground">
            Manage your users and their roles here.
          </p>
        </div>
        <UsersPrimaryButtons />
      </div>
      <UsersTable data={data} search={search} navigate={navigate} />
      <UsersDialogs />
    </UsersProvider>
  );
}
