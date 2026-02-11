import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto pl-64">
          <div className="min-h-screen theme-page p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
