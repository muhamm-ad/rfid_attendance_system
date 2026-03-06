import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="relative flex-1 min-h-0 h-screen overflow-y-auto w-full bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
