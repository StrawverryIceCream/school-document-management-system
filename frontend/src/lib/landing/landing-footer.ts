import type { Tone } from "@/lib/tones";

export type FooterItem = {
  label: string;
  // Items without an href render as plain text
  href?: string;
  tone?: Tone;
};

export type FooterColumn = {
  id: string;
  heading: string;
  items: FooterItem[];
};

export type FooterLink = {
  label: string;
  href: string;
};

export const FOOTER_BRAND = {
  name: "ARCH System",
  tagline: "School Documents & Credential Registry",
  description:
    "The automated scholastic records repository powering document processing, anti-tamper QR validation, and university registrar window queues.",
  build: "Current Build: v2.4.0 • Academic Registry Schema v3.2",
};

// Swap the hrefs for real routes as the sections and pages get built
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "services",
    heading: "Services",
    items: [
      { label: "Transcript of Records (TOR)", href: "#services" },
      { label: "Certificate of Registration (COR)", href: "#services" },
      { label: "True Copy of Grades (TCG)", href: "#services" },
      { label: "Honorable Dismissal", href: "#services" },
      { label: "Faculty Credentials", href: "#services" },
    ],
  },
  {
    id: "windows",
    heading: "Academic Windows",
    items: [
      { label: "College of Science (Window 1 & 2)", href: "#windows" },
      { label: "College of Engineering (Window 3)", href: "#windows" },
      { label: "Architecture & Fine Arts (Window 1)", href: "#windows" },
      { label: "Management & MS (Window 2)", href: "#windows" },
      { label: "Information Tech (Window 4)", href: "#windows" },
    ],
  },
  {
    id: "registrar-office",
    heading: "Registrar Office",
    items: [
      { label: "Main Campus Hall, 1st Floor" },
      { label: "registrar@university.edu.ph" },
      { label: "+63 (02) 8301-3000 local 412" },
      { label: "Windows: 8:00 AM – 5:00 PM", tone: "emerald" },
    ],
  },
];

export const FOOTER_COPYRIGHT =
  "© 2026 Office of the University Registrar. All rights reserved. System powered by ARCH.";

export const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Registrar Guidelines", href: "#" },
  { label: "Helpdesk", href: "#" },
];
