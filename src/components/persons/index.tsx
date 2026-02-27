import { type NavigateFn } from "@/hooks/use-table-url-state";
import { PersonsDialogs } from "@/components/persons/dialogs";
import { PersonsProvider } from "@/components/providers/persons-provider";
import { PersonsTable } from "@/components/persons/table";
import { Person } from "@/types";

import { BarChart3, Plus, RefreshCw, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePersons } from "@/hooks/use-persons";

export function PersonsPrimaryButtons({
  onRefresh,
}: {
  onRefresh?: () => void;
}) {
  const { setOpen } = usePersons();
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Button className="gap-2" onClick={() => setOpen("add")}>
          <Plus size={20} />
          Add Person
        </Button>
      )}
      <Button
        variant="outline"
        className="gap-2"
        title="View person statistics"
        onClick={() => router.push("/dashboard/persons/statistics")}
      >
        <BarChart3 size={20} />
        Statistics
      </Button>
      {onRefresh && (
        <Button
          onClick={onRefresh}
          className="gap-2"
          title="Refresh persons"
        >
          <RefreshCw size={20} />
          Refresh
        </Button>
      )}
    </div>
  );
}

export function Persons({
  data,
  search,
  navigate,
  variant = "default",
  onRefresh,
  error,
}: {
  data: Person[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
  variant?: "default" | "page";
  onRefresh?: () => void;
  error?: string | null;
}) {
  if (variant === "page") {
    return (
      <PersonsProvider>
        <div className="page-container h-full">
          <header className="page-header">
            <div className="page-title-group">
              <h1 className="page-title">
                <Users size={28} className="page-title-icon" aria-hidden />
                Person Management
              </h1>
              <p className="page-subtitle">
                Manage students, teachers, staff, and visitors
              </p>
            </div>
            <div className="page-actions">
              <PersonsPrimaryButtons onRefresh={onRefresh} />
            </div>
          </header>
          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}
          <div className="relative flex-1 h-full w-full">
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

  return (
    <PersonsProvider>
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
      <PersonsDialogs />
    </PersonsProvider>
  );
}
