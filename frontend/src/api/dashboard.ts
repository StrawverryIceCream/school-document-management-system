import type { DashboardStats, RequestType } from "@/types";
import { mockRequests, mockStats } from "./mockData";
import {USE_MOCK_DATA} from "@/config";

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

// Flip VITE_USE_MOCK_DATA=true in your .env.local to work on the dashboard
// UI without a running backend. Everything below this line is the only
// thing that changed — DashboardProvider.tsx and every component that
// calls these two functions stays exactly the same either way.


// Simulates real network latency so loading states are actually visible
// while testing with mock data.
function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK_DATA) {
    return delay(mockStats);
  }

  const url = "/api/admin/stats";
  const res = await fetch(url, { credentials: "include" });
  return handleResponse<DashboardStats>(res, url);
}

export async function getAllRequests(
  params: GetAllRequestsParams = {},
): Promise<PaginatedRequestResponse> {
  if (USE_MOCK_DATA) {
    return delay(buildMockResponse(params));
  }

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

function buildMockResponse(
  params: GetAllRequestsParams,
): PaginatedRequestResponse {
  let filtered = mockRequests;

  if (params.status) {
    filtered = filtered.filter((req) => req.status === params.status);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter((req) => {
      const studentName = req.studentName ?? "";
      const studentNumber = req.studentNumber ?? "";

      return (
        studentName.toLowerCase().includes(q) ||
        studentNumber.toLowerCase().includes(q)
      );
    });
  }

  const page = params.page ?? 1;
  const limit = (params.limit ?? filtered.length) || 1;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    data: paged,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  };
}
