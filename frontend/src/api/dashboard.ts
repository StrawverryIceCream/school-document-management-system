import type { DashboardStats, RequestType } from "@/types";

export interface GetAllRequestsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedRequestResponse {
  data: RequestType[];
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

export async function getDashboardStats(): Promise<DashboardStats> {
  const url = "/api/admin/stats";
  const res = await fetch(url, { credentials: "include" });
  return handleResponse<DashboardStats>(res, url);
}

export async function getAllRequests(
  params: GetAllRequestsParams = {},
): Promise<PaginatedRequestResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/admin/requests${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedRequestResponse>(res, url);
}