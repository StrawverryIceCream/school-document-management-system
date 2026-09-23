import { useDocuments } from "@/hooks/useDocuments";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

function DocumentList() {
  const { documents, loading, error } = useDocuments();
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
      {documents.map((doc) => (
        <Card key={doc.id} className="overflow-hidden py-0">
          <AccordionItem value={String(doc.id)} className="border-b-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <span className="font-medium">{doc.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent className="px-4 pb-4 text-muted-foreground">
                <p>{doc.description}</p>
                <div className="flex justify-end">
                  <Button variant="default" size="sm" asChild>
                    <Link to={`/new-request/${doc.id}`}>Select</Link>
                  </Button>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>
      ))}
    </Accordion>
  );
}

export default DocumentList;
