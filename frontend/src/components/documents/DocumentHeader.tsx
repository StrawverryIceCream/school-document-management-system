import PageHeader from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { resolveStaffOfficeCode } from "@/lib/documents";
import DocumentDialog from "./DocumentDialog";

export default function DocumentHeader() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const officeLabel = user?.officeRecord?.name ?? resolveStaffOfficeCode(user);

  const description = isStaff
    ? officeLabel
      ? `Manage and configure document types assigned to ${officeLabel}`
      : "Manage and configure document types assigned to your processing office"
    : "Manage and configure available document types, fees, and requirements";

  return (
    <PageHeader
      title="Document Manager"
      badge="Catalog"
      description={description}
    >
      {isAdmin ? <DocumentDialog /> : null}
    </PageHeader>
  );
}
