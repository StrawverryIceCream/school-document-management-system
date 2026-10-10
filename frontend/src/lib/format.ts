const PESO_FORMATTER = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const FILING_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const FILING_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function formatPeso(amount: number): string {
  return PESO_FORMATTER.format(amount);
}

export function formatFilingDate(isoTimestamp: string): string {
  return FILING_DATE_FORMATTER.format(new Date(isoTimestamp));
}

export function formatFilingTime(isoTimestamp: string): string {
  return FILING_TIME_FORMATTER.format(new Date(isoTimestamp));
}
