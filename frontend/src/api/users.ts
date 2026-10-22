// api/users.ts
import type { User, UserRole } from "@/types";

export interface UpdateUserBody {
  fullName?: string;
  studentId?: string | null;
  role?: UserRole;
  email?: string;
  isActive?: boolean;
  collegeId?: string | null;
  courseId?: string | null;
  section?: string | null;
  yearLevel?: number | null;
  studentStatus?: "regular" | "irregular" | "graduating" | "alumni" | null;
  department?: string | null;
  officeId?: string | null;
  office?: "registrar" | "hr" | null;
}

export interface GetAllUsersParams {
  search?: string;
  role?: UserRole;
  college?: string;
  course?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  data: User[];
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

export async function getAllUsers(
  params: GetAllUsersParams = {},
): Promise<PaginatedUsersResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.role) searchParams.set("role", params.role);
  if (params.college) searchParams.set("college", params.college);
  if (params.course) searchParams.set("course", params.course);
  if (params.department) searchParams.set("department", params.department);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/users${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedUsersResponse>(res, url);
}

export async function getUserById(id: string): Promise<User> {
  const url = `/api/users/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<User>(res, url);
}

export async function updateUserById(
  id: string,
  data: UpdateUserBody,
): Promise<User> {
  const url = `/api/users/${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<User>(res, url);
}

export async function deleteUserById(id: string): Promise<{ message: string }> {
  const url = `/api/users/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse<{ message: string }>(res, url);
}