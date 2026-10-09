import { useCallback, useMemo, useRef, useState } from "react";
import { getUserById } from "@/api/users";
import { ProfileContext } from "@/context/ProfileContext";
import type { ProfileContextType } from "@/context/ProfileContext";
import { useAuth } from "@/hooks/useAuth";

type Profiles = ProfileContextType["profiles"];
type Statuses = ProfileContextType["statuses"];

interface ProfileCache {
  viewerId: string | undefined;
  profiles: Profiles;
  statuses: Statuses;
}

const EMPTY_PROFILES: Profiles = {};
const EMPTY_STATUSES: Statuses = {};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const viewerId = user?.id;

  const [cache, setCache] = useState<ProfileCache>({
    viewerId,
    profiles: EMPTY_PROFILES,
    statuses: EMPTY_STATUSES,
  });
  const inFlightRef = useRef<Set<string>>(new Set());

  // Profiles cached for one login must never be shown to the next account in the same browser session
  const isCurrent = cache.viewerId === viewerId;
  const profiles = isCurrent ? cache.profiles : EMPTY_PROFILES;
  const statuses = isCurrent ? cache.statuses : EMPTY_STATUSES;

  const loadProfile = useCallback(
    async (id: string) => {
      // Prevent duplicate requests while the same card is already loading
      const flightKey = `${viewerId ?? "anonymous"}:${id}`;
      if (inFlightRef.current.has(flightKey)) return;
      inFlightRef.current.add(flightKey);

      setCache((prev) => {
        const base: ProfileCache =
          prev.viewerId === viewerId
            ? prev
            : { viewerId, profiles: EMPTY_PROFILES, statuses: EMPTY_STATUSES };
        return { ...base, statuses: { ...base.statuses, [id]: "loading" } };
      });

      try {
        const loaded = await getUserById(id);
        // Drop responses that finish after the viewer changed
        setCache((prev) =>
          prev.viewerId !== viewerId
            ? prev
            : {
                ...prev,
                profiles: { ...prev.profiles, [id]: loaded },
                statuses: { ...prev.statuses, [id]: undefined },
              },
        );
      } catch (err) {
        console.error("Profile load error:", err);
        setCache((prev) =>
          prev.viewerId !== viewerId
            ? prev
            : { ...prev, statuses: { ...prev.statuses, [id]: "error" } },
        );
      } finally {
        inFlightRef.current.delete(flightKey);
      }
    },
    [viewerId],
  );

  const value = useMemo(
    () => ({ profiles, statuses, loadProfile }),
    [profiles, statuses, loadProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}