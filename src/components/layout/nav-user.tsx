// @/components/layout/nav-user.tsx

import Link from "next/link";
import { Bell, ChevronsUpDown, KeyRound, LogOut } from "lucide-react";
import useDialogState from "@/hooks/use-dialog-state";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Logout from "@/components/logout-dialog";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useDialogState();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="rounded-lg tracking-normal data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  className="h-8 w-8 rounded-md"
                  fallbackClassName="rounded-md"
                />
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ms-auto size-4 text-sidebar-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm tracking-normal">
                  <UserAvatar
                    src={user.avatar}
                    name={user.name}
                    className="h-8 w-8 rounded-md"
                    fallbackClassName="rounded-md"
                  />
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold text-popover-foreground">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/credentials">
                    <KeyRound />
                    Credentials
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifications">
                    <Bell />
                    Notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setOpen(true)}
              >
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Logout open={!!open} onOpenChange={setOpen} />
    </>
  );
}
