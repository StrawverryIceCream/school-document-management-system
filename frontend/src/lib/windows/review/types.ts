import type { RequestReviewDetails } from "@/api/requests";
import type { RequestAttachment } from "@/types";

export interface ReviewData {
  request: RequestReviewDetails;
  attachments: RequestAttachment[];
  attachmentsError: string | null;
}

export interface ReviewField {
  key: string;
  label: string;
  value: unknown;
  fileField: boolean;
}
