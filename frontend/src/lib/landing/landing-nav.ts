import type { Tone } from "@/lib/tones";

export type NavLink = {
  label: string;
  href: string;
};

export const BRAND_NAME = "ARCH";
export const BRAND_VERSION = "v2.4 System";
export const BRAND_VERSION_TONE: Tone = "brand";
export const BRAND_TAGLINE = "School Docs & Credential Registry";
export const BRAND_HOME_HREF = "#";

export const NAV_ARIA_LABEL = "Primary";

// Swap the hrefs for real routes as the sections and pages get built
export const NAV_LINKS: NavLink[] = [
  { label: "Credentials Catalog", href: "#services" },
  { label: "College Windows", href: "#windows" },
  { label: "Track Request", href: "#track" },
  { label: "Verification & Security", href: "#security" },
  { label: "Help & Guidelines", href: "#faq" },
];

export const CHECK_STATUS_ACTION: NavLink = {
  label: "Check Status",
  href: "#track",
};

export const ACCESS_PORTAL_ACTION: NavLink = {
  label: "Access Portal",
  href: "#login",
};