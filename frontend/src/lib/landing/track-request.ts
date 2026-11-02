import {
  CircleCheck,
  Loader,
  PackageCheck,
  Stamp,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "@/lib/tones";

export type StageStatus = "done" | "active" | "upcoming";

export type Stage = {
  id: string;
  label: string;
  note: string;
  icon: LucideIcon;
  status: StageStatus;
};

// Each pipeline stage takes its colors from the tone matching its status
export const STAGE_TONES: Record<StageStatus, Tone> = {
  done: "emerald",
  active: "brand",
  upcoming: "neutral",
};

export const TRACK_SECTION = {
  id: "track",
  headingId: "track-request-heading",
  eyebrow: "Contactless Validation",
  title: "Track Document Status in Real-Time",
  description:
    "Track evaluation stages, clearance endorsements, cashier receipts, and pickup schedule without standing in line.",
};

export const TRACK_SEARCH = {
  inputId: "track-request-reference",
  ariaLabel: "Track a document request",
  inputLabel: "Reference ID",
  defaultReference: "REQ-2026-000018",
  submitLabel: "Inspect Workflow",
};

// Sample result shown on the landing page; replace with a real lookup later
export const TRACK_RESULT = {
  reference: "REQ-2026-000018",
  status: "Pending Staff Verification",
  statusTone: "amber" as Tone,
  title: "Transcript of Records (TOR)",
  requester:
    "Requester: Flores Benerao • BS Biology (College of Science, 3rd Year)",
  counterLabel: "Processing Office",
  counter: "Academic Records Office (Main Hall)",
  releaseLabel: "Estimated Release Target:",
  release: "October 14, 2026 (3–5 business days)",
  reminder: "Bring 1 Valid Institutional ID or delegation letter",
};

export const STAGES: Stage[] = [
  {
    id: "submitted",
    label: "Submitted",
    note: "Oct 10 • 09:42 AM",
    icon: CircleCheck,
    status: "done",
  },
  {
    id: "paid",
    label: "Paid (₱150)",
    note: "Cashier settled (GCash)",
    icon: CircleCheck,
    status: "done",
  },
  {
    id: "evaluation",
    label: "Evaluation",
    note: "Active: Alyson Benerao",
    icon: Loader,
    status: "active",
  },
  {
    id: "dry-seal",
    label: "Dry Seal",
    note: "College Registrar Office",
    icon: Stamp,
    status: "upcoming",
  },
  {
    id: "office-claim",
    label: "Office Claim",
    note: "Designated Office Pickup",
    icon: PackageCheck,
    status: "upcoming",
  },
];

export const PIPELINE_LABEL = `Official ${STAGES.length}-Stage Workflow Pipeline:`;
