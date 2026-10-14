
import {
  Award,
  Briefcase,
  Cog,
  Compass,
  Microscope,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "../tones";

export type DocumentCount = {
  label: string;
  count: number;
};

export type College = {
  code: string;
  house: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  tone: Tone;
  pending: number;
  counters: string;
  documents: DocumentCount[];
  queueLabel: string;
  queueHref: string;
};

// A queue at or above this size is shown as busy (amber), below it as light (emerald)
const QUEUE_BUSY_THRESHOLD = 5;

export const WINDOWS_SECTION = {
  id: "windows",
  headingId: "college-windows-heading",
  eyebrow: "Live Academic Counter Hub",
  title: "College Counter Windows",
  description:
    "Every academic department operates dedicated evaluation windows for specialized clearances, grade audits, and claim counters.",
};

export const COLLEGES: College[] = [
  {
    code: "COS",
    house: "House Firetalon",
    name: "College of Science",
    tagline: "Est. 1974 • Natural & Applied Sciences",
    icon: Microscope,
    tone: "brand",
    pending: 6,
    counters: "Window 1 & 2 Active",
    documents: [
      { label: "TOR", count: 3 },
      { label: "Enrollment Cert", count: 2 },
      { label: "TCG", count: 1 },
    ],
    queueLabel: "View COS Queue",
    queueHref: "#login",
  },
  {
    code: "COE",
    house: "House Ironbeaver",
    name: "College of Engineering",
    tagline: "Est. 1982 • Mechanical, Civil & Electrical",
    icon: Cog,
    tone: "amber",
    pending: 8,
    counters: "Window 3 Active",
    documents: [
      { label: "TOR", count: 4 },
      { label: "Clearance", count: 3 },
      { label: "CAV", count: 1 },
    ],
    queueLabel: "View COE Queue",
    queueHref: "#login",
  },
  {
    code: "CAFA",
    house: "House Silverwing",
    name: "College of Architecture",
    tagline: "Est. 1989 • Built Arts & Spatial Design",
    icon: Compass,
    tone: "neutral",
    pending: 4,
    counters: "Window 1 Active",
    documents: [
      { label: "Portfolio Cert", count: 2 },
      { label: "TCG", count: 2 },
    ],
    queueLabel: "View CAFA Queue",
    queueHref: "#login",
  },
  {
    code: "CMMS",
    house: "House Rosedove",
    name: "Management & MS",
    tagline: "Est. 1994 • Business & Governance",
    icon: Briefcase,
    tone: "rose",
    pending: 7,
    counters: "Window 2 Active",
    documents: [
      { label: "Honorable Dismissal", count: 3 },
      { label: "TOR", count: 2 },
    ],
    queueLabel: "View CMMS Queue",
    queueHref: "#login",
  },
  {
    code: "CIT",
    house: "House Bluemammoth",
    name: "Information Tech",
    tagline: "Est. 2001 • Computing & Informatics",
    icon: Terminal,
    tone: "sky",
    pending: 5,
    counters: "Window 4 Active",
    documents: [
      { label: "Enrollment Cert", count: 2 },
      { label: "Capstone Clearance", count: 2 },
    ],
    queueLabel: "View CIT Queue",
    queueHref: "#login",
  },
  {
    code: "CIE",
    house: "House Verdantant",
    name: "Industrial Education",
    tagline: "Est. 1978 • Vocational Pedagogies",
    icon: Award,
    tone: "emerald",
    pending: 4,
    counters: "Window 2 Active",
    documents: [
      { label: "Teacher Clearance", count: 2 },
      { label: "Cert of Reg", count: 2 },
    ],
    queueLabel: "View CIE Queue",
    queueHref: "#login",
  },
];

export const ACTIVE_UNITS_LABEL = `${COLLEGES.length} Academic Units Active`;

export const TOTAL_IN_QUEUE_LABEL = `${COLLEGES.reduce(
  (total, college) => total + college.pending,
  0,
)} Documents In Queue Today`;

export function getQueueTone(pending: number): Tone {
  return pending >= QUEUE_BUSY_THRESHOLD ? "amber" : "emerald";
}
