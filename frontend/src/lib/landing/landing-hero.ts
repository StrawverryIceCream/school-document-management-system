import type { Tone } from "@/lib/tones";

export type HeroLink = {
  label: string;
  href: string;
};

export type HeroStat = {
  id: string;
  value: string;
  caption: string;
  tone: Tone;
};

export type TicketField = {
  label: string;
  value: string;
  tone: Tone;
};

type SampleTicket = {
  tokenLabel: string;
  token: string;
  type: string;
  typeTone: Tone;
  fields: TicketField[];
  stage: {
    current: number;
    total: number;
    label: string;
    status: string;
    statusTone: Tone;
  };
};

const PERCENT_MAX = 100;

export const HERO_HEADING_ID = "landing-hero-heading";

// File lives in public/image/landing/, so it is served from /image/landing/
// Change the file name here to match your image
export const HERO_BACKGROUND = {
  src: "/images/landing/hero.jpeg",
};

export const HERO_PILL: { label: string; dotTone: Tone } = {
  label: "Digital Document Gateway for Students, Faculty & Alumni",
  dotTone: "emerald",
};

export const HERO_TITLE = {
  lead: "Frictionless academic records,",
  accent: "officially certified.",
};

export const HERO_DESCRIPTION =
  "Request official Transcripts of Records (TOR), Certificates of Registration (COR), True Copy of Grades, and faculty clearances. Track your requests in real-time, pay online or on-site, and pick up your documents through designated college service windows.";

// Swap the hrefs for real routes as the sections and pages get built
export const HERO_PRIMARY_CTA: HeroLink = {
  label: "Request a Document",
  href: "#services",
};

export const HERO_SECONDARY_CTA: HeroLink = {
  label: "Track Existing Slip",
  href: "#track",
};

export const HERO_STATS: HeroStat[] = [
  {
    id: "release-window",
    value: "Instant – 3d",
    caption: "Automated release window",
    tone: "neutral",
  },
  {
    id: "sis-verified",
    value: "100%",
    caption: "SIS-verified records",
    tone: "neutral",
  },
  {
    id: "qr-sealed",
    value: "QR Sealed",
    caption: "Anti-tamper digital pass",
    tone: "brand",
  },
];

export const TERMINAL: {
  title: string;
  location: string;
  status: string;
  tone: Tone;
} = {
  title: "Live Release Terminal",
  location: "Main Registrar Hall • Window 3",
  status: "Active Calling",
  tone: "emerald",
};

export const SAMPLE_TICKET: SampleTicket = {
  tokenLabel: "Reference Code",
  token: "REQ-2026-000018",
  type: "TOR-OFFICIAL",
  typeTone: "brand",
  fields: [
    {
      label: "Document",
      value: "Transcript of Records (2 Hard Copies)",
      tone: "neutral",
    },
    {
      label: "Requester",
      value: "Flores Benerao (BS Biology)",
      tone: "neutral",
    },
    {
      label: "Target Window",
      value: "Window 1 (Registrar Evaluation)",
      tone: "brand",
    },
  ],
  stage: {
    current: 4,
    total: 5,
    label: "University Seal Applied",
    status: "Ready Soon",
    statusTone: "emerald",
  },
};

export const STAGE_PROGRESS = Math.round(
  (SAMPLE_TICKET.stage.current / SAMPLE_TICKET.stage.total) * PERCENT_MAX,
);

export const TRACK_FORM = {
  inputId: "quick-track-reference",
  ariaLabel: "Quick track a request",
  label: "Track your submitted slip right now:",
  placeholder: "e.g. REQ-2026-000018",
  hint: "Enter your official institutional reference code (e.g. REQ-2026-000018).",
  submitLabel: "Check",
  progressLabel: "Release pipeline progress",
};

export const TRACK_ROUTE = "#track";

export function buildTrackRoute(reference: string): string {
  return `#track?ref=${encodeURIComponent(reference)}`;
}
