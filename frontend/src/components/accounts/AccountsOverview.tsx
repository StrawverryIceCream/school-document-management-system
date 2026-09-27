import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers } from "@/hooks/useUsers";
import { ShieldCheck, UsersRound, UserCog, GraduationCap } from "lucide-react";

function AccountsOverview() {
  const { users, loading } = useUsers();

  const summaryCards = [
    { label: "Total Accounts", value: users.length, icon: UsersRound },
    { label: "Students", value: users.filter((user) => user.role === "student").length, icon: GraduationCap },
    { label: "Staff", value: users.filter((user) => user.role === "staff").length, icon: UserCog },
    { label: "Admins", value: users.filter((user) => user.role === "admin").length, icon: ShieldCheck },
  ];

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="border-border/80 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {loading ? "—" : value}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export default AccountsOverview;
