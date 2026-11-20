import { useOrgNames } from "@/hooks/useOrgNames";
import { cn } from "@/lib/utils";
import {
  getProfileFields,
  getRoleIdRequirementLabel,
  type ProfileUser,
} from "@/lib/profile";

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
                  key === "email" ? "break-all" : "wrap-break-word",
                  isEmpty && "font-normal text-muted-foreground",
                )}
              >
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
      <p
        role="note"
        className="mt-5 rounded-lg border-l-4 border-primary bg-muted/50 p-3 text-sm text-muted-foreground"
      >
        <span className="block font-medium text-foreground">
          School guidance
        </span>
        These details are verified from your school record and appear on the documents
        you request. If anything is incorrect or incomplete, visit the Registrar&apos;s
        Office and bring your {getRoleIdRequirementLabel(user.role)}.
      </p>
    </div>
  );
}