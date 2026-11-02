import type { Tone } from "@/lib/tones";
import {
  SYSTEM_NAME,
  SYSTEM_VERSION_LABEL,
  SYSTEM_TAGLINE,
} from "@/lib/constants";

export type NavLink = {
  label: string;
  href: string;
};

export const BRAND_NAME = SYSTEM_NAME;
export const BRAND_VERSION = SYSTEM_VERSION_LABEL;
export const BRAND_VERSION_TONE: Tone = "brand";
export const BRAND_TAGLINE = SYSTEM_TAGLINE;
export const BRAND_HOME_HREF = "/";

export const NAV_ARIA_LABEL = "Primary";

export const NAV_LINKS: NavLink[] = [
  { label: "College Windows", href: "#windows" },
  { label: "Credentials Catalog", href: "#services" },
  { label: "Track Request", href: "#track" },
  { label: "Verify Claim Slip", href: "/requests/claim" },
];

export const CHECK_STATUS_ACTION: NavLink = {
  label: "Check Status",
  href: "#track",
};

export const ACCESS_PORTAL_ACTION: NavLink = {
  label: "Access Portal",
  href: "/login",
};