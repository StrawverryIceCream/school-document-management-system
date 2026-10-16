import type { LogEntry, LogStats, LogType } from "@/context/LogsContext";

export interface GetLogsParams {
  search?: string;
  type?: "all" | LogType;
  page?: number;
  limit?: number;
}

interface PaginatedLogsResponse {
  data: LogEntry[];
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

export async function getLogs(
  params: GetLogsParams = {},
): Promise<LogEntry[]> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.type && params.type !== "all") {
    searchParams.set("type", params.type);
  }
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/logs${query ? `?${query}` : ""}`;
  const res = await fetch(url, { credentials: "include" });
  const response = await handleResponse<PaginatedLogsResponse>(res, url);

  return response.data;
}

export async function getLogStats(): Promise<LogStats> {
  const url = "/api/logs/stats";
  const res = await fetch(url, { credentials: "include" });
  return handleResponse<LogStats>(res, url);
}

export type { LogEntry };
