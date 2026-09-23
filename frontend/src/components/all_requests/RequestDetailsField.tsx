interface RequestDetailsFieldProps {
  label: string;
  value: string;
  className?: string;
}

function RequestDetailsField({ label, value, className }: RequestDetailsFieldProps) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

export default RequestDetailsField;