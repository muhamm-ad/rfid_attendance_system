import { type NavigateFn } from "@/hooks/use-table-url-state";
import { AttendancesTable } from "@/components/attendances/table";
import { PageHeader } from "@/components/page-header";
import { PageContainer } from "@/components/page-container";
import { AttendanceLog } from "@/types";
import { BarChart3, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function AttendancesPrimaryButtons() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      className="gap-2"
      title="View attendance statistics"
      onClick={() => router.push("/dashboard/attendances/statistics")}
    >
      <BarChart3 size={20} />
      Statistics
    </Button>
  );
}

export function Attendances({
  data,
  search,
  navigate,
  onRefresh,
  error,
}: {
  data: AttendanceLog[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
  onRefresh?: () => void;
  error?: string | null;
}) {
  return (
    <PageContainer>
      <PageHeader
        icon={Clock}
        title="Attendance Logs"
        subtitle="View all access attempts and attendance records"
        actions={<AttendancesPrimaryButtons />}
      />
      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        <AttendancesTable
          data={data}
          search={search}
          navigate={navigate}
          onRefresh={onRefresh}
        />
      </div>
    </PageContainer>
  );
}
