export interface OfficeRecord {
  id: string;
  code: string;
  name: string;
  sector: string;
  category: string;
  officialEmail?: string | null;
  parentOfficeId?: string | null;
  isActive: boolean;
  activeDocumentCount: number;
}

export async function getOffices(params: {
  withActiveDocs?: boolean;
  activeOnly?: boolean;
} = {}): Promise<OfficeRecord[]> {
  const searchParams = new URLSearchParams();
  if (params.withActiveDocs) searchParams.set("withActiveDocs", "true");
  if (params.activeOnly) searchParams.set("activeOnly", "true");

  const query = searchParams.toString();
  const url = `/api/offices${query ? `?${query}` : ""}`;

  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to fetch offices: ${res.statusText}`);
  }
  const body = await res.json();
  return body.data ?? [];
}
