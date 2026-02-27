import { type NavigateFn } from "@/hooks/use-table-url-state";
import { PersonsDialogs } from "@/components/persons/dialogs";
import { PersonsProvider } from "@/components/providers/persons-provider";
import { PersonsTable } from "@/components/persons/table";
import { Person } from "@/types";

import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePersons } from "@/hooks/use-persons";

export function PersonsPrimaryButtons() {
  const { setOpen } = usePersons();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) return null;

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="space-x-1"
        onClick={() => setOpen("add")}
      >
        <span>Add Person</span> <Plus size={18} />
      </Button>
    </div>
  );
}


export function Persons({
  data,
  search,
  navigate,
}: {
  data: Person[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
}) {
  return (
    <PersonsProvider>
      {/* <Main className="flex flex-1 flex-col gap-4 sm:gap-6"> */}
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Person List</h2>
            <p className="text-muted-foreground">
              Manage your persons and their roles here.
            </p>
          </div>
          <PersonsPrimaryButtons />
        </div>
        <PersonsTable data={data} search={search} navigate={navigate} />
      {/* </Main> */}

      <PersonsDialogs />
    </PersonsProvider>
  );
}
