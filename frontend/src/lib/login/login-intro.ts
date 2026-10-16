import type { Tone } from "@/lib/tones";

export type IntroStat = {
  id: string;
  label: string;
  value: string;
  caption: string;
  tone: Tone;
};

export const INTRO_HEADING_ID = "login-intro-heading";

export const INTRO_PILL: { label: string; dotTone: Tone } = {
  label: "Unified Registrar Clearance Service",
  dotTone: "brand",
};

export const INTRO_TITLE = {
  lead: "Frictionless academic records,",
  accent: "officially certified.",
};

export const INTRO_DESCRIPTION =
  "Securely issue, sign, track, and claim Transcripts of Records (TOR), Certificates of Registration (COR), True Copy of Grades, and graduation credentials.";

export const INTRO_STATS: IntroStat[] = [
  {
    id: "processing",
    label: "Processing",
    value: "Instant – 3d",
    caption: "Automated window",
    tone: "neutral",
  },
  {
    id: "validation",
    label: "Validation",
    value: "100% SIS",
    caption: "Verified records",
    tone: "neutral",
  },
  {
    id: "security",
    label: "Security",
    value: "QR Sealed",
    caption: "Anti-tamper pass",
    tone: "brand",
  },
];

export const INTRO_NOTICE = {
  title: "Counter Window Schedule",
  body: "Main Registrar Hall Windows 1 to 4 are open Mon–Fri, 8:00 AM – 5:00 PM for physically sealed document pickups.",
};
