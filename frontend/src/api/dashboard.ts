import type { DashboardStats } from "@/context/DashboardContext";

async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${url} responded ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const url = "/api/admin/stats"; // ⚠️ i-confirm sa groupmate mo kung ito ba talaga ang tamang path
  const res = await fetch(url, { credentials: "include" });
  return handleResponse<DashboardStats>(res, url);
}