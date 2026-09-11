import type { User } from "@/types";

interface UpdateUserBody {
  fullName?: string;
  studentId?: string | null;
  role?: "student" | "teacher" | "admin" | "staff";
  email?: string;
}

export interface GetAllUsersParams {
  search?: string;
  role?: string;
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

export async function getAllUsers(
  params: GetAllUsersParams = {},
): Promise<PaginatedUsersResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.role) searchParams.set("role", params.role);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/users${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `${url} responded ${res.status}${text ? `: ${text}` : ""}`,
    );
  }

  return res.json();
}

export async function getUserById(id: string) {
  const res = await fetch(`/api/users/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/users/${id} responded ${res.status}${text ? `: ${text}` : ""}`,
    );
  }

  return res.json();
}

export async function updateUserById(id: string, data: UpdateUserBody) {
  const res = await fetch(`/api/users/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/users/${id} update failed ${res.status}${text ? `: ${text}` : ""}`,
    );
  }
}

export async function deleteUserById(id: string) {
  const res = await fetch(`/api/users/${id}`, {
    credentials: "include",
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/users/${id} delete failed ${res.status}${text ? `: ${text}` : ""}`,
    );
  }
  return res.json();
}
