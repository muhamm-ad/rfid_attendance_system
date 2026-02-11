// @/app/dashboard/(general)/persons/page.tsx

import PersonsTable from "#/src/components/persons";

export default function PersonsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PersonsTable />
    </div>
  );
}
