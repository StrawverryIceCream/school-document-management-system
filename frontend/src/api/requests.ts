// api/requests.ts
import type { DocumentRequestWithRelations, RequestStatus } from "@/types";

export type FormDataValue = string | number | boolean;

// Bare request row, as returned by create, status update, and cancel
export type DocumentRequestRow = Omit<
  DocumentRequestWithRelations,
  "user" | "documentType" | "payments"
>;

export type RequestReviewDetails = DocumentRequestWithRelations & {
  availableTransitions: RequestStatus[];
};

// A student's own request: same as the staff view, minus the requester
export type MyRequest = Omit<DocumentRequestWithRelations, "user">;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAllRequestsParams {
  search?: string;
  status?: RequestStatus;
  userId?: string;
  college?: string;
  collegeId?: string;
  officeId?: string;
  officeCode?: string;
  sector?: string;
  page?: number;
  limit?: number;
}

export interface GetMyRequestsParams {
  status?: RequestStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedRequestsResponse {
  data: DocumentRequestWithRelations[];
  pagination: Pagination;
}

export interface PaginatedMyRequestsResponse {
  data: MyRequest[];
  pagination: Pagination;
}

export interface CreateRequestPayload {
  documentTypeId: string;
  purpose?: string;
  // Keyed by each required field's label
  formData?: Record<string, FormDataValue>;
}

export interface UpdateRequestStatusPayload {
  status: RequestStatus;
  // YYYY-MM-DD, required by the backend when status is "ready"
  releaseDate?: string | null;
  releasePdfUrl?: string | null;
  staffNotes?: string | null;
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

// ---------- Staff / admin ----------

export async function getAllRequests(
  params: GetAllRequestsParams = {},
): Promise<PaginatedRequestsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.college) searchParams.set("college", params.college);
  if (params.collegeId) searchParams.set("collegeId", params.collegeId);
  if (params.officeId) searchParams.set("officeId", params.officeId);
  if (params.officeCode) searchParams.set("officeCode", params.officeCode);
  if (params.sector) searchParams.set("sector", params.sector);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/requests${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedRequestsResponse>(res, url);
}

export async function getRequestById(
  id: string,
): Promise<RequestReviewDetails> {
  const url = `/api/requests/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<RequestReviewDetails>(res, url);
}

export async function updateRequestStatus(
  id: string,
  payload: UpdateRequestStatusPayload,
): Promise<DocumentRequestRow> {
  const url = `/api/requests/${id}/status`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<DocumentRequestRow>(res, url);
}

export async function assignRequest(
  id: string,
  assignedTo: string | null,
): Promise<DocumentRequestWithRelations> {
  const url = `/api/requests/${id}/assign`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignedTo }),
  });

  return handleResponse<DocumentRequestWithRelations>(res, url);
}

export async function getOfficeStaff(
  officeIdOrCode: string,
): Promise<Array<{ id: string; fullName: string; email: string; role: string }>> {
  const url = `/api/offices/${officeIdOrCode}/staff`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<Array<{ id: string; fullName: string; email: string; role: string }>>(
    res,
    url,
  );
}

// ---------- Requester (student) ----------

export async function getMyRequests(
  params: GetMyRequestsParams = {},
): Promise<PaginatedMyRequestsResponse> {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/requests/me${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedMyRequestsResponse>(res, url);
}

export async function getMyRequestById(id: string): Promise<MyRequest> {
  const url = `/api/requests/me/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<MyRequest>(res, url);
}

export async function createRequest(
  payload: CreateRequestPayload,
): Promise<DocumentRequestRow> {
  const url = "/api/requests";

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<DocumentRequestRow>(res, url);
}

export async function cancelMyRequest(id: string): Promise<DocumentRequestRow> {
  const url = `/api/requests/me/${id}/cancel`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });

  return handleResponse<DocumentRequestRow>(res, url);
}