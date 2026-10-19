import { useDocument } from "@/hooks/useDocument";
import { Button } from "@/components/ui/button";

const FIRST_PAGE = 1;

function DocumentNavPage() {
  const { page, setPage, totalPages } = useDocument();
  return (
    <div className="flex items-center justify-between px-4 ">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= FIRST_PAGE}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default DocumentNavPage;
