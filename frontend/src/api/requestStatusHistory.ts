import type { RequestStatus, RequestStatusHistory } from "@/types";

export interface GetRequestStatusHistoryParams {
  requestId?: string;
  changedBy?: string;
  fromStatus?: RequestStatus;
  toStatus?: RequestStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedRequestStatusHistoryResponse {
  data: RequestStatusHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateRequestStatusHistoryDTO {
  requestId: string;
  fromStatus?: RequestStatus | null;
  toStatus: RequestStatus;
  changedBy?: string | null;
  note?: string | null;
}

export interface UpdateRequestStatusHistoryDTO {
  note?: string | null;
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function getAllRequestStatusHistory(
  params: GetRequestStatusHistoryParams = {},
): Promise<PaginatedRequestStatusHistoryResponse> {
  const searchParams = new URLSearchParams();

  if (params.requestId) searchParams.set("requestId", params.requestId);
  if (params.changedBy) searchParams.set("changedBy", params.changedBy);
  if (params.fromStatus) searchParams.set("fromStatus", params.fromStatus);
  if (params.toStatus) searchParams.set("toStatus", params.toStatus);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/request-status-history${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedRequestStatusHistoryResponse>(res, url);
}

export async function getRequestStatusHistoryById(
  id: string,
): Promise<RequestStatusHistory> {
  const url = `/api/request-status-history/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<RequestStatusHistory>(res, url);
}

export async function createRequestStatusHistory(
  data: CreateRequestStatusHistoryDTO,
): Promise<RequestStatusHistory> {
  const url = `/api/request-status-history`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<RequestStatusHistory>(res, url);
}

export async function updateRequestStatusHistory(
  id: string,
  data: UpdateRequestStatusHistoryDTO,
): Promise<RequestStatusHistory> {
  const url = `/api/request-status-history/${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<RequestStatusHistory>(res, url);
}

export async function deleteRequestStatusHistory(
  id: string,
): Promise<{ message: string }> {
  const url = `/api/request-status-history/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res, url);
}
