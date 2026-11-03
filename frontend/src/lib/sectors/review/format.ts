export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => displayValue(item)).join(", ");
  }
  return JSON.stringify(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}
