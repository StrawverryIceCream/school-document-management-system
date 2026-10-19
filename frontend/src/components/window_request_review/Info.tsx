export function Info({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">
        {value === null || value === undefined || value === ""
          ? "Not available"
          : value}
      </p>
    </div>
  );
}
