import { CircleUser } from "lucide-react";
import ProfileFields from "@/components/profile/ProfileFields";
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
import { useOrgNames } from "@/hooks/useOrgNames"; // TEMP
import { getInitials, ROLE_META } from "@/lib/profile";

function Profile() {
  const { user } = useAuth();
  const role = user ? ROLE_META[user.role] : undefined;
  const { college, course } = useOrgNames(user?.collegeId, user?.courseId); // TEMP

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <CircleUser />
          Profile
        </DropdownMenuItem>
      </DialogTrigger>
      {/* No fixed height: the dialog grows with however many fields the role has */}
      <DialogContent className="sm:max-w-2xl">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 items-center justify-center">
                <AvatarFallback className="text-2xl font-normal leading-none">
                  {getInitials(user?.fullName || "Unknown")}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 gap-1 text-left leading-tight">
                <DialogTitle className="truncate text-xl font-medium leading-tight">
                  {user?.fullName}
                </DialogTitle>
                {/* Email now lives in the field list; Radix still wants a description for screen readers */}
                <DialogDescription className="sr-only">
                  Account details
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
          {user && <ProfileFields user={user} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Profile;