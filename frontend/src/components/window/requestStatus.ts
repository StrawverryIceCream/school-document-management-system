import type { RequestStatus } from "@/types";

export const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: "#f97316",
  processing: "#f97316",
  ready: "#16a34a",
  claimed: "#16a34a",
  rejected: "#dc2626",
  cancelled: "#6b7280",
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "PENDING",
  processing: "PROCESSING",
  ready: "READY",
  claimed: "CLAIMED",
  rejected: "REJECTED",
  cancelled: "CANCELLED",
};