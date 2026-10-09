import { useUsers } from "@/hooks/useUsers";
import {
  GraduationCap,
  ShieldCheck,
  UserCog,
  UsersRound,
  BriefcaseBusiness,
} from "lucide-react";

function AccountsOverview() {
  const { users, loading } = useUsers();

  const summaryCards = [
    { label: "Total Accounts", value: users.length, icon: UsersRound },
    {
      label: "Students",
      value: users.filter((user) => user.role === "student").length,
      icon: GraduationCap,
    },
    {
      label: "Teachers",
      value: users.filter((user) => user.role === "teacher").length,
      icon: BriefcaseBusiness,
    },
    {
      label: "Staff",
      value: users.filter((user) => user.role === "staff").length,
      icon: UserCog,
    },
    {
      label: "Admins",
      value: users.filter((user) => user.role === "admin").length,
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {summaryCards.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="relative rounded-xl border bg-card p-4 shadow-sm h-28"
        >
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>

          <div className="pr-10 flex flex-col justify-between h-full">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-semibold tracking-tight">
              {loading ? "—" : value}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default AccountsOverview;
