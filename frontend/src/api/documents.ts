import type { DocumentType } from "@/types";

export interface RequiredField {
  label: string;
  type: string;
  required: boolean;
}

export interface GetAllDocumentParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedDocumentResponse {
  data: DocumentType[];
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

export async function getAllDocument(
  params: GetAllDocumentParams = {},
): Promise<PaginatedDocumentResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.isActive !== undefined)
    searchParams.set("isActive", String(params.isActive));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/documents${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedDocumentResponse>(res, url);
}

export async function getDocumentById(id: number): Promise<DocumentType> {
  const res = await fetch(`/api/documents/${id.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/documents/${id} responded ${res.status}${text ? `: ${text}` : ""}`,
    );
  }

  return res.json() as Promise<DocumentType>;
}

export async function createDocument(
  payload: Omit<DocumentType, "id" | "createdAt" | "updatedAt">,
): Promise<DocumentType> {
  const url = "/api/documents";

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<DocumentType>(res, url);
}

export async function updateDocument(
  id: string,
  payload: Partial<Omit<DocumentType, "id" | "createdAt" | "updatedAt">>,
): Promise<DocumentType> {
  const url = `/api/documents/${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<DocumentType>(res, url);
}

export async function deleteDocumentById(
  id: string,
): Promise<{ message: string }> {
  const url = `/api/documents/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse<{ message: string }>(res, url);
}
