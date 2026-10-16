import type { RequestAttachment } from "@/types";


export interface GetRequestAttachmentsParams {
  search?: string;
  requestId?: string;
  uploadedBy?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedRequestAttachmentsResponse {
  data: GetRequestAttachmentsParams[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateRequestAttachmentDTO {
  requestId: string;
  uploadedBy: string;
  label?: string | null;
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
}

export interface UpdateRequestAttachmentDTO {
  label?: string | null;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function getAllRequestAttachments(
  params: GetRequestAttachmentsParams = {}
): Promise<PaginatedRequestAttachmentsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.requestId) searchParams.set("requestId", params.requestId);
  if (params.uploadedBy) searchParams.set("uploadedBy", params.uploadedBy);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/request-attachments${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedRequestAttachmentsResponse>(res, url);
}

export async function getRequestAttachmentById(
  id: string
): Promise<RequestAttachment> {
  const url = `/api/request-attachments/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<RequestAttachment>(res, url);
}

export async function createRequestAttachment(
  data: CreateRequestAttachmentDTO
): Promise<RequestAttachment> {
  const url = `/api/request-attachments`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<RequestAttachment>(res, url);
}

export async function updateRequestAttachment(
  id: string,
  data: UpdateRequestAttachmentDTO
): Promise<RequestAttachment> {
  const url = `/api/request-attachments/${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<RequestAttachment>(res, url);
}

export async function deleteRequestAttachment(
  id: string
): Promise<{ message: string }> {
  const url = `/api/request-attachments/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res, url);
}