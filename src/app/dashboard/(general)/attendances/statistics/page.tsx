// @/app/dashboard/(general)/attendances/statistics/page.tsx

import { AttendancesStats } from "@/components/statistics/attendances-stats";

export default function AttendanceStatisticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AttendancesStats />
    </div>
  );
}
