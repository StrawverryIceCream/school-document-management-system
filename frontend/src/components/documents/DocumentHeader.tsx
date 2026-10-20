import PageHeader from "@/components/shared/PageHeader";
import DocumentDialog from "./DocumentDialog";

export default function DocumentHeader() {
  return (
    <PageHeader
      title="Document Manager"
      badge="Catalog"
      description="Manage and configure available document types, fees, and requirements"
    >
      <DocumentDialog />
    </PageHeader>
  );
}
