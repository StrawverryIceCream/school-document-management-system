import { useOrgNames } from "@/hooks/useOrgNames";
import { getProfileFields, type ProfileUser } from "@/lib/profile";
import { cn } from "@/lib/utils";

const FULL_WIDTH_KEYS = ["college", "course", "department"];

type ProfileFieldsProps = React.ComponentProps<"div"> & {
  user: ProfileUser;
};

export default function ProfileFields({
  className,
  user,
  ...props
}: ProfileFieldsProps) {
  const { college, course } = useOrgNames(user.collegeId, user.courseId);
  const fields = getProfileFields({
    ...user,
    college: user.college?.name ? user.college : college,
    course: user.course?.name ? user.course : course,
  });
 
  return (
    <div className={className} {...props}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        {fields.map(({ key, label, icon: Icon, value, isEmpty }) => (
          <div
            key={key}
            className={cn("flex items-start gap-3", FULL_WIDTH_KEYS.includes(key) && "col-span-2")}
          >
            <Icon
              className="mt-1 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd
                className={cn(
                  "text-base font-medium",
                  key === "email" ? "break-all" : "break-words",
                  isEmpty && "font-normal text-muted-foreground",
                )}
              >
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}