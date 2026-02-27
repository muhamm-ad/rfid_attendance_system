import { type NavigateFn } from "@/hooks/use-table-url-state";
import { UsersDialogs } from "@/components/users/dialogs";
import { UsersProvider } from "@/components/providers/users-provider";
import { UsersTable } from "@/components/users/table";
import { User } from "@/types";
import { MailPlus, UserPlus, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/use-users";

export function UsersPrimaryButtons() {
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
    </div>
  );
}

export function Users({
  data,
  search,
  navigate,
  onRefresh,
  error,
}: {
  data: User[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
  onRefresh?: () => void;
  error?: string | null;
}) {
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
                Manage users and their roles and access permissions
              </p>
            </div>
            <div className="page-actions">
              <UsersPrimaryButtons />
            </div>
          </header>
          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col">
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
