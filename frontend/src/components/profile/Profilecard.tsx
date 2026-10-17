import ProfileFields from "@/components/profile/ProfileFields";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, ROLE_META } from "@/lib/profile";
import type { ProfileUser } from "@/lib/profile-fields";
import { cn } from "@/lib/utils";

type ProfileCardProps = React.ComponentProps<"div"> & {
  user: ProfileUser | undefined;
  error: boolean;
  onRetry: () => void;
};

function ProfileCard({
  className,
  user,
  error,
  onRetry,
  ...props
}: ProfileCardProps) {
  if (!user && error) {
    return (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        <p className="text-sm text-destructive">
          Couldn&apos;t load this profile.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        aria-busy="true"
        {...props}
      >
        <Skeleton className="size-14 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  const role = ROLE_META[user.role];

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-center gap-3">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-lg font-semibold">{user.fullName}</p>
          <Badge variant={role.variant} className="w-fit">
            {role.label}
          </Badge>
        </div>
      </div>
      <Separator />
      <ProfileFields user={user} />
    </div>
  );
}

export default ProfileCard;
