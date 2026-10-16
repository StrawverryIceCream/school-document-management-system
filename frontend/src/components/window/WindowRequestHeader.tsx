import { ArrowLeft, CircleAlert, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useWindowView } from "@/hooks/useWindowView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function WindowRequestHeader() {
  const {
    TILES,
    activeView,
    clearView,
    departmentRequests,
    loading,
    error,
    refreshRequests,
    setGuidelinesOpen,
  } = useWindowView();
  const college = TILES.find((tile) => tile.id === activeView);
  const collegeTitle = college?.title ?? activeView ?? "Department";
  const collegeDescription = college?.description ?? collegeTitle;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setGuidelinesOpen(true)}
        >
          <CircleAlert className="size-4" aria-hidden="true" />
          Guidelines
        </Button>
      </div>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearView}
            className="-ml-2 mb-1 h-8 gap-1.5"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Windows
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-normal">
              {collegeTitle} Requests
            </h1>
            <Badge variant="secondary" className="font-mono text-sm">
              Queue #{departmentRequests.length}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            All document requests submitted by {collegeDescription} students,
            faculty, and professors
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm">
            <span
              className={cn(
                "size-2 rounded-full",
                error
                  ? "bg-destructive"
                  : loading
                    ? "bg-amber-500"
                    : "bg-emerald-600",
              )}
            />
            <span className="font-medium">
              {error
                ? "Service Unavailable"
                : loading
                  ? "Connecting"
                  : "Service Active"}
            </span>
            <span className="text-muted-foreground">| {collegeTitle} Desk</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={async () => {
              try {
                await refreshRequests();
                toast.success("Request queue synced.");
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Could not sync the request queue.",
                );
              }
            }}
          >
            <LoaderCircle className="size-4" aria-hidden="true" />
            Sync
          </Button>
        </div>
      </section>
    </>
  );
}
