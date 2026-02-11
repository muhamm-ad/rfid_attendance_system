// @/app/dashboard/(general)/attendances/page.tsx

import LogsTable from "#/src/components/attendances";

export default function AttendancePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <LogsTable />
    </div>
  );
}
