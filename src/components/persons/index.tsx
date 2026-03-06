import { type NavigateFn } from "@/hooks/use-table-url-state";
import { PersonsDialogs } from "@/components/persons/dialogs";
import { PersonsProvider } from "@/components/providers/persons-provider";
import { PersonsTable } from "@/components/persons/table";
import { PageHeader } from "@/components/page-header";
import { Person, UserRole, UserRoleEnum } from "@/types";

import { BarChart3, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePersons } from "@/hooks/use-persons";

function PersonsPrimaryButtons() {
  const { setOpen } = usePersons();
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role as UserRole | undefined;

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        name="View person statistics"
        className="gap-2"
        title="View person statistics"
        onClick={() => router.push("/dashboard/persons/statistics")}
      >
        <BarChart3 size={20} />
        Statistics
      </Button>
      {(userRole === UserRoleEnum.ADMIN || userRole === UserRoleEnum.CASHIER) && (
        <Button
          className="gap-2"
          name="Add Person"
          title="Add Person"
          onClick={() => setOpen("add")}
        >
          <Plus size={20} />
          Add Person
        </Button>
      )}
    </div>
  );
}

export function Persons({
  data,
  search,
  navigate,
  onRefresh,
  error,
}: {
  data: Person[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
  onRefresh?: () => void;
  error?: string | null;
}) {
  return (
    <PersonsProvider>
      <div className="page-container h-full">
        <PageHeader
          icon={Users}
          title="Person & Badge Management"
          subtitle="Manage persons, badges and their types"
          actions={<PersonsPrimaryButtons />}
        />
        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col">
          <PersonsTable
            data={data}
            search={search}
            navigate={navigate}
            onRefresh={onRefresh}
          />
        </div>
        <PersonsDialogs />
      </div>
    </PersonsProvider>
  );
}
