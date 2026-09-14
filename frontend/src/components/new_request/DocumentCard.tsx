import type { DocumentType } from "@/types";

import { Card, CardContent, CardHeader } from "../ui/card";

function DocumentCard({ document }: { document: DocumentType }) {
  return (
    <Card
      key={document.id}
      className="group cursor-pointer p-6 shadow-sm transition hover:shadow-md"
    >
      <CardHeader className="mb-5 p-0">
        <h3 className="text-xl font-semibold">{document.name}</h3>
        <p className="text-sm text-muted-foreground">{document.code}</p>
      </CardHeader>

      <CardContent className="p-0">
        <p className="line-clamp-3 text-base text-muted-foreground">
          {document.description || "No description"}
        </p>
      </CardContent>
    </Card>
  );
}

export default DocumentCard;
