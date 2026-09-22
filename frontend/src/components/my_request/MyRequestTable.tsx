import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

function MyRequestTable() {
  return (
    <section className="space-y-4">
      <Card className="rounded-xl border border-dashed bg-muted/20 shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              No document requests yet.
            </h2>
            <p className="text-sm text-muted-foreground">
              Your submitted document requests will appear here.
            </p>
          </div>
          <Button asChild variant="default" size="sm">
            <Link to="/new-request">Request a Document</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export default MyRequestTable;
