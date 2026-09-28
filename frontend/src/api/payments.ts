// api/payments.ts
import type { DocumentRequestRow } from "@/api/requests";
import type { DocumentType, Payment, User } from "@/types";

export type PaymentMethod = "card" | "e_wallet" | "bank_transfer";

export type PaymentPayer = Pick<
  User,
  "id" | "studentId" | "fullName" | "email"
>;

// A student's own payment: the request and its document type
export type MyPayment = Payment & {
  request: DocumentRequestRow & { documentType: DocumentType };
};

// Staff view: also includes who paid
export type PaymentWithDetails = Payment & {
  request: DocumentRequestRow & {
    user: PaymentPayer;
    documentType: DocumentType;
  };
};

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAllPaymentsParams {
  search?: string;
  method?: PaymentMethod;
  requestId?: string;
  page?: number;
  limit?: number;
}

export interface GetMyPaymentsParams {
  page?: number;
  limit?: number;
}

export interface PaginatedPaymentsResponse {
  data: PaymentWithDetails[];
  pagination: Pagination;
}

export interface PaginatedMyPaymentsResponse {
  data: MyPayment[];
  pagination: Pagination;
}

export interface CreatePaymentPayload {
  requestId: string;
  method: PaymentMethod;
}

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

// ---------- Requester ----------

// The backend takes the amount from the document type's fee, so it is not sent
export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const url = "/api/payments";

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<Payment>(res, url);
}

export async function getMyPayments(
  params: GetMyPaymentsParams = {},
): Promise<PaginatedMyPaymentsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/payments/me${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedMyPaymentsResponse>(res, url);
}

export async function getMyPaymentById(id: string): Promise<MyPayment> {
  const url = `/api/payments/me/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<MyPayment>(res, url);
}

// ---------- Staff / admin ----------

export async function getAllPayments(
  params: GetAllPaymentsParams = {},
): Promise<PaginatedPaymentsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.method) searchParams.set("method", params.method);
  if (params.requestId) searchParams.set("requestId", params.requestId);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/payments${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaginatedPaymentsResponse>(res, url);
}

export async function getPaymentById(id: string): Promise<PaymentWithDetails> {
  const url = `/api/payments/${id}`;

  const res = await fetch(url, { credentials: "include" });
  return handleResponse<PaymentWithDetails>(res, url);
}