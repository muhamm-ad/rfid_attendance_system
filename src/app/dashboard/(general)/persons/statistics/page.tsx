// @/app/dashboard/(general)/persons/statistics/page.tsx

import { PersonsStats } from "@/components/statistics/persons-stats";

export default function PersonsStatisticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PersonsStats />
    </div>
  );
}
