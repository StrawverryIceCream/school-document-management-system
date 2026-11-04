export interface SystemSettingsResponse {
  activeAcademicTerm: string;
  systemVersion: string;
  systemVersionLabel: string;
}

export async function getSystemSettings(): Promise<SystemSettingsResponse> {
  const res = await fetch("/api/settings", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch system settings");
  }
  return res.json();
}

export async function updateSystemSettings(
  settings: Partial<{
    activeAcademicTerm: string;
    systemVersion: string;
    systemVersionLabel: string;
  }>,
): Promise<SystemSettingsResponse> {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Failed to update system settings",
    );
  }
  return res.json();
}
