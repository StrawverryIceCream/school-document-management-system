import { CircleUser } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import ProfileDetail from "@/components/profile/ProfileDetail";
import {
  getContactNumber,
  getInitials,
  getTupIdLabel,
  ROLE_META,
} from "@/lib/profile";

function Profile() {
  const { user } = useAuth();
  const role = user ? ROLE_META[user.role] : undefined;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <CircleUser />
          Profile
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-200 sm:h-200">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 items-center justify-center">
                <AvatarFallback className="text-3xl font-normal leading-none">
                  {getInitials(user?.fullName || "Unknown")}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 gap-1 text-left leading-tight">
                <DialogTitle className="truncate text-lg font-medium leading-tight">
                  {user?.fullName}
                </DialogTitle>
                <DialogDescription className="truncate text-base">
                  {user?.email}
                </DialogDescription>
                {role && (
                  <Badge variant={role.variant} className="w-fit">
                    {role.label}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>
          <Separator />
          {user && (
            <div className="flex flex-col gap-3">
              <ProfileDetail
                label="TUP ID"
                value={getTupIdLabel(user.studentId)}
              />
              <ProfileDetail
                label="Contact number"
                value={getContactNumber(user.id)}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Profile;
