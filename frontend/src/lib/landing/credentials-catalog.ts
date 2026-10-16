import type { Tone } from "@/lib/tones";

export type CredentialDetail = {
  label: string;
  value: string;
  tone: Tone;
};

export type Credential = {
  code: string;
  codeTone: Tone;
  featured: boolean;
  turnaround: string;
  turnaroundTone: Tone;
  title: string;
  description: string;
  details: CredentialDetail[];
  feeLabel: string;
  fee: string;
  feeSuffix?: string;
  feeTone: Tone;
  requestHref: string;
};

// Total credentials the registrar offers, including the ones not shown as cards
const CATALOG_TOTAL = 8;

export const CATALOG_SECTION = {
  id: "services",
  headingId: "credentials-catalog-heading",
  eyebrow: "Available Credentials",
  title: "Official Issuance Schemas & Fees",
  description:
    "Standard cashier rates with automated fee assessments. Faculty requests enjoy institutional waivers as stipulated in university policy.",
};

export const FEATURED_LABEL = "Most Requested";
export const REQUEST_LABEL = "Request This";

// Swap the hrefs for real request routes as the pages get built
export const CREDENTIALS: Credential[] = [
  {
    code: "COR",
    codeTone: "brand",
    featured: false,
    turnaround: "Instant (Auto)",
    turnaroundTone: "emerald",
    title: "Certificate of Registration",
    description:
      "Confirms enrolled subjects, units matriculated, and official term validation.",
    details: [
      { label: "Eligibility", value: "Undergraduate & Senior High", tone: "neutral" },
      { label: "Dynamic Fields", value: "4 Form Fields", tone: "neutral" },
    ],
    feeLabel: "Assessment Fee",
    fee: "₱50.00",
    feeTone: "neutral",
    requestHref: "#login",
  },
  {
    code: "TOR",
    codeTone: "brand",
    featured: true,
    turnaround: "5–7 Business Days",
    turnaroundTone: "amber",
    title: "Transcript of Records",
    description:
      "Permanent scholastic record with registrar dry seal, grading scales, and Dean sign-off.",
    details: [
      { label: "Eligibility", value: "Alumni, Graduating, Active", tone: "neutral" },
      {
        label: "Dynamic Fields",
        value: "9 Form Fields (Special Purpose)",
        tone: "neutral",
      },
    ],
    feeLabel: "Assessment Fee",
    fee: "₱150.00",
    feeTone: "brand",
    requestHref: "#login",
  },
  {
    code: "TCG",
    codeTone: "brand",
    featured: false,
    turnaround: "2–3 Days",
    turnaroundTone: "neutral",
    title: "True Copy of Grades",
    description:
      "Official GPA & unit evaluation certificate specifically formatted for scholarship retention.",
    details: [
      { label: "Eligibility", value: "DOST & Academic Scholars", tone: "neutral" },
      { label: "Dynamic Fields", value: "6 Form Fields", tone: "neutral" },
    ],
    feeLabel: "Assessment Fee",
    fee: "₱50.00",
    feeTone: "neutral",
    requestHref: "#login",
  },
  {
    code: "FAC-EMP",
    codeTone: "amber",
    featured: false,
    turnaround: "1–2 Days",
    turnaroundTone: "sky",
    title: "Cert. of Employment & Load",
    description:
      "Confirms active faculty tenure, current teaching load, and compensation history.",
    details: [
      { label: "Eligibility", value: "Faculty & Institutional Staff", tone: "neutral" },
      { label: "HRIS Sync", value: "Automated Direct Sync", tone: "emerald" },
    ],
    feeLabel: "Institutional Rate",
    fee: "₱0.00",
    feeSuffix: "(Waived)",
    feeTone: "emerald",
    requestHref: "#login",
  },
  {
    code: "HD",
    codeTone: "brand",
    featured: false,
    turnaround: "3–5 Days",
    turnaroundTone: "neutral",
    title: "Honorable Dismissal / Transfer",
    description:
      "Required when transferring to another university; includes library & department clearance.",
    details: [
      { label: "Eligibility", value: "Exiting Students / Transferring", tone: "neutral" },
      { label: "Clearance Reqs", value: "All Depts Cleared", tone: "neutral" },
    ],
    feeLabel: "Assessment Fee",
    fee: "₱100.00",
    feeTone: "neutral",
    requestHref: "#login",
  },
  {
    code: "CAV",
    codeTone: "brand",
    featured: false,
    turnaround: "5–7 Days",
    turnaroundTone: "amber",
    title: "CHED / DFA Certification (CAV)",
    description:
      "Authentication and verification package for foreign employment, embassies, or PRC boards.",
    details: [
      {
        label: "Eligibility",
        value: "Graduates & Licensed Professionals",
        tone: "neutral",
      },
      { label: "Seal Type", value: "CHED Special Order", tone: "neutral" },
    ],
    feeLabel: "Assessment Fee",
    fee: "₱300.00",
    feeTone: "neutral",
    requestHref: "#login",
  },
];

export const CATALOG_CALLOUT = {
  title: "Need a specialized customized credential or urgent certification?",
  description:
    "Contact the Registrar evaluation liaison or submit dynamic field requests via your student portal.",
  ctaLabel: `View Complete Catalog (${CATALOG_TOTAL})`,
  ctaHref: "#login",
};
