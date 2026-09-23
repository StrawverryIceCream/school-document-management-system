import { CircleUser } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Avatar } from "../ui/avatar";
import { AvatarFallback } from "radix-ui/avatar";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

function Profile() {
  const { user } = useAuth();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <CircleUser />
          Profile
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-200 sm:h-200 ">
        <div className="flex flex-col gap-1">
          <DialogHeader>
            <div className="flex items-center gap-4 ">
              <Avatar className="h-20 w-20 items-center justify-center">
                <AvatarFallback className="text-3xl font-normal leading-none">
                  {getInitials(user?.fullName || "Unknown")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight ">
                <span className="truncate font-medium text-lg">
                  {user?.fullName}
                </span>
                <span className="truncate text-base text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Profile;
