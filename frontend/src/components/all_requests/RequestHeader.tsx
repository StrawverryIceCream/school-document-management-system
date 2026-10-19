import { Download } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default function RequestHeader() {
  return (
    <PageHeader
      title="All Requests"
      badge="Database Records"
      description="All document requests submitted across departments and windows"
    >
      <Button variant="outline" className="h-11 px-5 text-base">
        <Download className="size-5 mr-2" aria-hidden="true" />
        Export Report
      </Button>
    </PageHeader>
  );
}
