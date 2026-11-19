import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultHomeRoute } from "@/lib/navigation/role-access";
import type { AuthUser, UserRole } from "@/types";

interface RequireRoleProps {
  allowedRoles: readonly UserRole[];
  checkAccess?: (user: AuthUser) => boolean;
  children: React.ReactNode;
}

export default function RequireRole({
  allowedRoles,
  checkAccess,
  children,
}: RequireRoleProps) {
  const { user, loading } = useAuth();

  const isDenied =
    !loading &&
    Boolean(user) &&
    (!allowedRoles.includes(user!.role) ||
      (checkAccess !== undefined && !checkAccess(user!)));

  useEffect(() => {
    if (isDenied) {
      toast.error("You don't have access to that page.", {
        id: "route-access-denied",
      });
    }
  }, [isDenied]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isDenied) {
    return <Navigate to={getDefaultHomeRoute(user.role)} replace />;
  }

  return <>{children}</>;
}
