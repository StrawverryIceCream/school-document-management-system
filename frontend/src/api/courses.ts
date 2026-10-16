// ==========================================
// Types & Interfaces
// ==========================================

import type { Course } from "@/types";

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

export interface PaginatedCoursesResponse {
  data: Course[];
  pagination: PaginatedMeta;
}

export interface GetCoursesParams extends PaginationParams {
  collegeId?: string;
}
export interface CreateCourseDTO {
  collegeId: string;
  code: string;
  name: string;
  isActive?: boolean;
}

export type UpdateCourseDTO = Partial<CreateCourseDTO>;

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

// ==========================================
// Courses API
// ==========================================S

export async function getAllCourses(
  params: GetCoursesParams = {},
): Promise<PaginatedCoursesResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.collegeId) searchParams.set("collegeId", params.collegeId);
  if (params.isActive !== undefined)
    searchParams.set("isActive", String(params.isActive));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/courses${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedCoursesResponse>(res, url);
}

export async function getCourseById(id: string): Promise<Course> {
  const url = `/api/courses/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<Course>(res, url);
}

export async function createCourse(data: CreateCourseDTO): Promise<Course> {
  const url = `/api/courses`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<Course>(res, url);
}

export async function updateCourse(
  id: string,
  data: UpdateCourseDTO,
): Promise<Course> {
  const url = `/api/courses/${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<Course>(res, url);
}

export async function deleteCourse(id: string): Promise<{ message: string }> {
  const url = `/api/courses/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res, url);
}
