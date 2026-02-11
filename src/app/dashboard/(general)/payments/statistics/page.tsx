// @/app/dashboard/(general)/payments/statistics/page.tsx

import { PaymentsStats } from "@/components/statistics/payments-stats";

export default function PaymentsStatisticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PaymentsStats />
    </div>
  );
}
