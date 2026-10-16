import type { Appointment, AppointmentStatus } from "@/types";

export interface GetAppointmentsParams {
  search?: string;
  userId?: string;
  windowId?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAppointmentsResponse {
  data: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAppointmentDTO {
  userId: string;
  windowId: string;
  requestId?: string;
  purpose?: string;
  scheduledAt: string; // ISO date string
}

export interface UpdateAppointmentDTO {
  windowId?: string;
  requestId?: string | null;
  purpose?: string | null;
  scheduledAt?: string;
  status?: AppointmentStatus;
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function getAllAppointments(
  params: GetAppointmentsParams = {},
): Promise<PaginatedAppointmentsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.windowId) searchParams.set("windowId", params.windowId);
  if (params.status) searchParams.set("status", params.status);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/appointments${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedAppointmentsResponse>(res, url);
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const url = `/api/appointments/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<Appointment>(res, url);
}

export async function createAppointment(
  data: CreateAppointmentDTO,
): Promise<Appointment> {
  const url = `/api/appointments`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<Appointment>(res, url);
}

export async function updateAppointment(
  id: string,
  data: UpdateAppointmentDTO,
): Promise<Appointment> {
  const url = `/api/appointments/${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<Appointment>(res, url);
}

export async function deleteAppointment(
  id: string,
): Promise<{ message: string }> {
  const url = `/api/appointments/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res, url);
}
