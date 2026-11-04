import type { AccountUpdateRequest } from "@/types";

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return typeof data?.error === "string" ? data.error : fallback;
}

export async function getMyAccountUpdate(): Promise<{
  updateRequest: AccountUpdateRequest | null;
}> {
  const res = await fetch("/api/account-updates/me", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, "Failed to fetch academic verification status"),
    );
  }
  return res.json();
}

export async function submitAccountUpdate(
  formData: FormData,
): Promise<{ updateRequest: AccountUpdateRequest }> {
  const res = await fetch("/api/account-updates", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, "Failed to submit verification request"),
    );
  }
  return res.json();
}

export interface ListAccountUpdatesParams {
  status?: "pending" | "approved" | "rejected" | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListAccountUpdatesResponse {
  data: AccountUpdateRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function listAccountUpdates(
  params: ListAccountUpdatesParams = {},
): Promise<ListAccountUpdatesResponse> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/account-updates${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, "Failed to list verification requests"),
    );
  }
  return res.json();
}

export async function reviewAccountUpdate(
  id: string,
  payload: { decision: "approved" | "rejected"; rejectionReason?: string },
): Promise<{ updateRequest: AccountUpdateRequest }> {
  const res = await fetch(`/api/account-updates/${id}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, "Failed to review verification request"),
    );
  }
  return res.json();
}
