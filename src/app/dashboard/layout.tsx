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
        {/* <main className="relative flex-1 min-h-0 w-full bg-red-200"> */}
        <main className="relative flex-1 min-h-0 w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
