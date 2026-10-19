import { getAllRequestAttachments } from "@/api/requestStatusAttachments";
import { getRequestById } from "@/api/requests";
import { ATTACHMENTS_FETCH_LIMIT } from "@/lib/window_request_review/constants";
import type { ReviewData } from "@/lib/window_request_review/types";
import type { RequestAttachment } from "@/types";

export async function fetchReviewData(requestId: string): Promise<ReviewData> {
  const request = await getRequestById(requestId);
  let attachments: RequestAttachment[] = [];
  let attachmentsError: string | null = null;

  try {
    const response = await getAllRequestAttachments({
      requestId,
      limit: ATTACHMENTS_FETCH_LIMIT,
    });
    attachments = response.data;
  } catch (err) {
    attachmentsError =
      err instanceof Error ? err.message : "Could not load supporting files.";
  }

  return { request, attachments, attachmentsError };
}
