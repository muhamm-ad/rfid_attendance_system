// src/app/dashboard/page.tsx

import { auth } from "#/src/lib/auth";
import{ Dashboard } from "@/components/dashboard";

export default async function DashboardPage() {
    const session = await auth();

    const userRole = session?.user.role;
    // const userId = session?.user.id;

    // const isUserAdmin = userRole === "ADMIN";
    // const isUserStaff = userRole === "STAFF";
    // const isUserViewer = userRole === "VIEWER";

  return <Dashboard userRole={userRole} />;
}