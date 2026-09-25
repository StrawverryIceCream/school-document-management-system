import type {
  DocumentRequest,
  DocumentRequestWithRelations,
  RequestStatus,
} from "@/types";

export interface GetAllRequestsParams {
  search?: string;
  status?: RequestStatus;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedRequestsResponse {
  data: DocumentRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function getAllRequests(
  params: GetAllRequestsParams = {},
): Promise<PaginatedRequestsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/requests${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedRequestsResponse>(res, url);
}

export async function getRequestById(
  id: string,
): Promise<DocumentRequestWithRelations> {
  const res = await fetch(`/api/requests/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/requests/${id} responded ${res.status}${text ? `: ${text}` : ""}`,
    );
  }

  return res.json() as Promise<DocumentRequestWithRelations>;
}