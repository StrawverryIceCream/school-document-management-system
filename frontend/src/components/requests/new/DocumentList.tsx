import { useDocument } from "@/hooks/useDocument";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPeso } from "@/lib/format";
import { Link } from "react-router-dom";

function DocumentList() {
  const { documents, loading, error } = useDocument();
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Something went wrong: {error}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading Documents...</p>
      </div>
    );
  }
  return (
    <Accordion
      type="single"
      collapsible
      className="flex max-w-lg flex-col gap-3"
    >
      {documents.map((doc) => {
        const fee = Number(doc.fee);
        const isFree = !Number.isFinite(fee) || fee <= 0;
        const feeText = isFree ? "Free" : formatPeso(fee);
        const officeName =
          doc.officeRecord?.name ?? doc.officeRecord?.code ?? doc.office;
        const turnaroundText =
          doc.processingDays > 0
            ? `${doc.processingDays} working ${doc.processingDays === 1 ? "day" : "days"}`
            : "Same-day";

        return (
          <Card key={doc.id} className="overflow-hidden py-0">
            <AccordionItem value={String(doc.id)} className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <span className="font-medium">{doc.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent asChild>
                <CardContent className="flex flex-col gap-3 px-4 pb-4 text-muted-foreground">
                  <p className="text-sm">{doc.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {officeName}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {feeText}
                      </span>
                      <span>•</span>
                      <span>{turnaroundText}</span>
                    </div>
                    <Button variant="default" size="sm" asChild>
                      <Link to={`/new-request/${doc.id}`}>Select</Link>
                    </Button>
                  </div>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Card>
        );
      })}
    </Accordion>
  );
}

export default DocumentList;
