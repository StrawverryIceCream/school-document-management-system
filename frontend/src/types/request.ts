export type RequestStatus =
  | "in_review"
  | "ready_for_pickup"
  | "awaiting_payment";

export type FilingType = "standard" | "express";

export type RequestFilter = "all" | "in_progress" | "ready_to_claim";

export type DocumentRequestItem = {
  id: string;
  // Short public reference shown to the student, e.g. "#8245f2d5"
  reference: string;
  filingType: FilingType;
  documentName: string;
  documentDetail: string;
  // ISO 8601 timestamp; formatted at render time
  filedAt: string;
  status: RequestStatus;
  // Required to render the amount on the Pay button when status is awaiting_payment
  amountDue?: number;
};
