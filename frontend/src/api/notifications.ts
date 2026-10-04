import type { Notification } from "@/context/NotificationContext";

export interface GetMyNotificationsParams {
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SendNotificationPayload {
  userId: string;
  message: string;
  title?: string;
  requestId?: string | null;
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new NotificationApiError(
      res.status,
      `${url} responded ${res.status}${text ? `: ${text}` : ""}`,
    );
  }
  return res.json();
}

export class NotificationApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "NotificationApiError";
    this.status = status;
  }
}

export async function getMyNotifications(
  params: GetMyNotificationsParams = {},
): Promise<PaginatedNotificationResponse> {
  const searchParams = new URLSearchParams();

  if (params.isRead !== undefined)
    searchParams.set("isRead", String(params.isRead));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/notifications${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedNotificationResponse>(res, url);
}

export async function getUnreadCount(): Promise<{ unread: number }> {
  const url = "/api/notifications/unread-count";

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<{ unread: number }>(res, url);
}

export async function sendNotification(
  payload: SendNotificationPayload,
): Promise<Notification> {
  const url = "/api/notifications";

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<Notification>(res, url);
}

export async function markAsRead(id: string): Promise<Notification> {
  const url = `/api/notifications/${id}/read`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });

  return handleResponse<Notification>(res, url);
}

export async function markAllAsRead(): Promise<{ updated: number }> {
  const url = "/api/notifications/read-all";

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });

  return handleResponse<{ updated: number }>(res, url);
}

export async function deleteNotification(
  id: string,
): Promise<{ message: string }> {
  const url = `/api/notifications/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse<{ message: string }>(res, url);
}
