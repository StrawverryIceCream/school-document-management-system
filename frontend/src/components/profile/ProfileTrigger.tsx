import type { ReactElement } from "react";
import ProfileCard from "@/components/profile/Profilecard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { PROFILE_VIEWER_ROLES } from "@/lib/profile";

type ProfileTriggerProps = {
  userId: string;
  // Must be a single focusable element (button or link) so keyboard users can open the card
  children: ReactElement;
};

function ProfileTrigger({ userId, children }: ProfileTriggerProps) {
  const { user: authUser } = useAuth();
  const { profiles, statuses, loadProfile } = useProfile();

  // The auth user already has every field the card shows, so the own card works even if the fetch fails
  const user =
    profiles[userId] ?? (authUser?.id === userId ? authUser : undefined);
  const failed = statuses[userId] === "error";

  // Profiles are admin and staff only; everyone else gets the bare element with no popover
  const canView = authUser
    ? PROFILE_VIEWER_ROLES.includes(authUser.role)
    : false;

  // Refetch on every open so edits made on the accounts page show up; the cached user renders meanwhile
  function handleOpenChange(open: boolean) {
    if (open) void loadProfile(userId);
  }

  if (!canView) return children;

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,40rem)]">
        <ProfileCard
          user={user}
          error={failed}
          onRetry={() => void loadProfile(userId)}
        />
      </PopoverContent>
    </Popover>
  );
}

export default ProfileTrigger;
