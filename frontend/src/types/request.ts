import type { WindowViewId } from "@/types/window";

export type RequesterRole = "student" | "professor";
export type RequestStatus = "processing" | "done" | "cancelled";

export interface DocumentRequest {
  id: string;
  requesterName: string;
  requesterRole: RequesterRole;
  college: WindowViewId;
  documentType: string;
  dateRequested: string;
  status: RequestStatus;
}