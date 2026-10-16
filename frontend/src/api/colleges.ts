// ==========================================
// Types & Interfaces
// ==========================================

import type { College } from "@/types";

export interface PaginationParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCollegesResponse {
  data: College[];
  pagination: PaginatedMeta;
}

export interface CreateCollegeDTO {
  code: string;
  name: string;
  isActive?: boolean;
}

export type UpdateCollegeDTO = Partial<CreateCollegeDTO>;

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

// ==========================================
// Colleges API
// ==========================================

export async function getAllColleges(
  params: PaginationParams = {},
): Promise<PaginatedCollegesResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.isActive !== undefined)
    searchParams.set("isActive", String(params.isActive));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/colleges${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedCollegesResponse>(res, url);
}

export async function getCollegeById(id: string): Promise<College> {
  const url = `/api/colleges/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<College>(res, url);
}

export async function createCollege(data: CreateCollegeDTO): Promise<College> {
  const url = `/api/colleges`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<College>(res, url);
}

export async function updateCollege(
  id: string,
  data: UpdateCollegeDTO,
): Promise<College> {
  const url = `/api/colleges/${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<College>(res, url);
}

export async function deleteCollege(id: string): Promise<{ message: string }> {
  const url = `/api/colleges/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res, url);
}
