import type { DocumentType } from "@/types";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Link } from "react-router-dom";

function DocumentCard({ document }: { document: DocumentType }) {
  return (
    <Link to={`/new-request/${document.id}`} className="block">
      <Card className="group cursor-pointer p-6 shadow-sm transition hover:shadow-md">
        <CardHeader className=" p-0">
          <h3 className="text-xl font-semibold">{document.name}</h3>
          <p className="text-sm text-muted-foreground">{document.code}</p>
        </CardHeader>

        <CardContent className="p-0">
          <p className="line-clamp-3 text-base text-muted-foreground">
            {document.description || "No description"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default DocumentCard;
