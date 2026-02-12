// @/components/layout/app-sidebar.tsx

"use client";

import {
  Clock,
  CreditCard,
  FileText,
  IdCardLanyard,
  Sliders,
  Users,
  FileStack,
  Database,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRole } from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/layout/nav-user";
import { NavGroup } from "@/components/layout/nav-group";
import Loading from "@/components/ui/loading";

const navGroups = [
  {
    title: "General",
    items: [
      {
        title: "Attendances",
        url: "/dashboard/attendances",
        icon: Clock,
      },
      {
        title: "Persons",
        url: "/dashboard/persons",
        icon: Users,
      },
      {
        title: "Payments",
        url: "/dashboard/payments",
        icon: CreditCard,
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: FileText,
      },
    ],
  },
];

const adminNavGroups = [
  {
    title: "Settings",
    items: [
      {
        title: "Parameters",
        url: "/dashboard/admin/parameters",
        icon: Sliders,
      },
      {
        title: "Users",
        url: "/dashboard/admin/users",
        icon: Users,
      },
      {
        title: "Logs",
        url: "/dashboard/admin/logs",
        icon: FileStack,
      },
      {
        title: "Prisma Studio",
        url: "/dashboard/admin/database",
        icon: Database,
      },
    ],
  },
];

export function AppSidebar() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role as UserRole | undefined;
  const isAdmin = userRole === "ADMIN";

  if (status === "loading" || !session) {
    return <Loading />;
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-3 justify-center mb-4">
        <IdCardLanyard className="h-8 w-8 shrink-0 text-primary" />
        <span className="font-semibold text-foreground">
          RFID Access Control
        </span>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <NavGroup key={group.title} title={group.title} items={group.items} />
        ))}
        {isAdmin &&
          adminNavGroups.map((group) => (
            <NavGroup
              key={group.title}
              title={group.title}
              items={group.items}
            />
          ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: session.user?.name || "",
            email: session.user?.email || "",
            avatar: session.user?.image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
