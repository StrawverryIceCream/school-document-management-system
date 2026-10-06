import { cn } from "@/lib/utils";

type ProfileDetailProps = React.ComponentProps<"div"> & {
  label: string;
  value: string;
};

function ProfileDetail({
  className,
  label,
  value,
  ...props
}: ProfileDetailProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)} {...props}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="break-all text-sm font-medium">{value}</span>
    </div>
  );
}

export default ProfileDetail;
