import type { Tone } from "@/lib/tones";
import {
  SYSTEM_NAME,
  SYSTEM_TAGLINE,
  SYSTEM_VERSION,
} from "@/lib/constants";

export type FooterItem = {
  label: string;
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
  name: `${SYSTEM_NAME} System`,
  tagline: SYSTEM_TAGLINE,
  description:
    "The official scholastic records repository powering document processing, anti-tamper QR verification, and designated college office queues.",
  build: `Current Build: ${SYSTEM_VERSION} • Production Grade`,
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "services",
    heading: "Services",
    items: [
      { label: "Transcript of Records (TOR)", href: "#services" },
      { label: "Certificate of Registration (COR)", href: "#services" },
      { label: "True Copy of Grades (TCG)", href: "#services" },
      { label: "Verify Claim Slip", href: "/requests/claim" },
      { label: "Access Student Portal", href: "/login" },
    ],
  },
  {
    id: "offices",
    heading: "Academic Offices",
    items: [
      { label: "College of Science Office", href: "#offices" },
      { label: "College of Engineering Office", href: "#offices" },
      { label: "Architecture & Fine Arts Office", href: "#offices" },
      { label: "Management & MS Office", href: "#offices" },
      { label: "Information Tech Office", href: "#offices" },
    ],
  },
  {
    id: "registrar-office",
    heading: "Registrar Office",
    items: [
      { label: "Main Campus Hall, 1st Floor" },
      { label: "registrar@university.edu.ph" },
      { label: "+63 (02) 8301-3000 local 412" },
      { label: "Counters: 8:00 AM – 5:00 PM", tone: "emerald" },
    ],
  },
];

export const FOOTER_COPYRIGHT =
  `© 2026 Office of the University Registrar. All rights reserved. System powered by ${SYSTEM_NAME}.`;

export const LEGAL_LINKS: FooterLink[] = [
  { label: "Terms of Service", href: "#services" },
  { label: "Registrar Guidelines", href: "#offices" },
  { label: "Track Document", href: "#track" },
  { label: "Verify QR Code", href: "/requests/claim" },
];
