import { createContext } from "react";
import type { User } from "@/types";

export type ProfileStatus = "loading" | "error";

export interface ProfileContextType {
  // Keyed by user id; kept so a reopened card renders instantly
  profiles: Record<string, User>;
  statuses: Record<string, ProfileStatus | undefined>;
  loadProfile: (id: string) => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);
