import {
  ArrowLeftRight,
  CircleUser,
  EllipsisVertical,
  LogOut,
  UserIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenu,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { User } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

function NavUser({ user }: { user: User }) {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch(err){
      console.log(err)
    }
    finally {
      navigate("/login");
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserIcon className="h-8 w-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.fullName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.fullName}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem>
              <CircleUser />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ArrowLeftRight />
              Switch Account
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default NavUser;
