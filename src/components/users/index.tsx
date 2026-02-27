import { type NavigateFn } from "@/hooks/use-table-url-state";
import { UsersDialogs } from "@/components/users/dialogs";
import { UsersProvider } from "@/components/providers/users-provider";
import { UsersTable } from "@/components/users/table";
import { User } from "@/types";
import { MailPlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/use-users";

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers();
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="space-x-1"
        onClick={() => setOpen("invite")}
      >
        <span>Invite User</span> <MailPlus size={18} />
      </Button>
      <Button className="space-x-1" onClick={() => setOpen("add")}>
        <span>Add User</span> <UserPlus size={18} />
      </Button>
    </div>
  );
}

export function Users({
  data,
  search,
  navigate,
}: {
  data: User[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
}) {
  return (
    <UsersProvider>
      {/* <Main className="flex flex-1 flex-col gap-4 sm:gap-6"> */}
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
      {/* </Main> */}

      <UsersDialogs />
    </UsersProvider>
  );
}
