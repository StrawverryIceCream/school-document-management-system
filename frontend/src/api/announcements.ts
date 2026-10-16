import type { Announcement, UserCategory } from "@/types";

export interface GetAnnouncementsParams {
  search?: string;
  audience?: UserCategory;
  isPinned?: boolean;
  createdById?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAnnouncementsResponse {
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAnnouncementDTO {
  title: string;
  body: string;
  audience?: UserCategory | null;
  isPinned?: boolean;
  publishedAt?: string | null; // ISO Date string
  expiresAt?: string | null; // ISO Date string
  createdBy: string;
}

export interface UpdateAnnouncementDTO {
  title?: string;
  body?: string;
  audience?: UserCategory | null;
  isPinned?: boolean;
  publishedAt?: string | null;
  expiresAt?: string | null;
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function getAllAnnouncements(
  params: GetAnnouncementsParams = {},
): Promise<PaginatedAnnouncementsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.audience) searchParams.set("audience", params.audience);
  if (params.isPinned !== undefined)
    searchParams.set("isPinned", String(params.isPinned));
  if (params.createdById) searchParams.set("createdById", params.createdById);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/announcements${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedAnnouncementsResponse>(res, url);
}

export async function getAnnouncementById(id: string): Promise<Announcement> {
  const url = `/api/announcements/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<Announcement>(res, url);
}

export async function createAnnouncement(
  data: CreateAnnouncementDTO,
): Promise<Announcement> {
  const url = `/api/announcements`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<Announcement>(res, url);
}

export async function updateAnnouncement(
  id: string,
  data: UpdateAnnouncementDTO,
): Promise<Announcement> {
  const url = `/api/announcements/${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<Announcement>(res, url);
}

export async function deleteAnnouncement(
  id: string,
): Promise<{ message: string }> {
  const url = `/api/announcements/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res, url);
}
