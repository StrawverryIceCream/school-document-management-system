import { Check, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/window_request_review/format";
import { cn } from "@/lib/utils";
import type { RequestReviewDetails } from "@/api/requests";

interface WorkflowPipelineCardProps {
  request: RequestReviewDetails;
}

export function WorkflowPipelineCard({ request }: WorkflowPipelineCardProps) {
  const steps = [
    {
      id: "submitted",
      title: "1. Request Submitted",
      detail: formatDate(request.createdAt),
      done: true,
    },
    {
      id: "payment",
      title: "2. Payment Verified",
      detail: Number(request.amountDue) === 0 ? "Free Assessment Cleared" : "OR Verified",
      done: request.status !== "pending",
    },
    {
      id: "eval",
      title: "3. Staff Document Evaluation",
      detail: "Assigned Registrar Desk",
      active: request.status === "processing",
      done: request.status === "ready" || request.status === "claimed",
    },
    {
      id: "sealing",
      title: "4. Dry Seal & Signatures",
      detail: "College Registrar Office",
      done: request.status === "ready" || request.status === "claimed",
    },
    {
      id: "ready",
      title: "5. Ready for Window Claiming",
      detail: request.releaseDate ? `Target: ${formatDate(request.releaseDate)}` : "Window Counter 1",
      done: request.status === "claimed",
      active: request.status === "ready",
    },
  ];

  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-bold text-foreground">
          Workflow Pipeline
        </h2>
        <Badge variant="secondary" className="text-xs">
          {request.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-3 before:w-0.5 before:bg-muted">
        {steps.map((s, idx) => (
          <div key={idx} className="relative flex flex-col gap-0.5">
            {s.done ? (
              <span className="absolute -left-6 top-0.5 size-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                <Check className="size-2.5" />
              </span>
            ) : s.active ? (
              <span className="absolute -left-6 top-0.5 size-4 rounded-full bg-primary text-primary-foreground ring-4 ring-primary/20 flex items-center justify-center text-[10px]">
                <Edit3 className="size-2.5" />
              </span>
            ) : (
              <span className="absolute -left-6 top-0.5 size-4 rounded-full bg-muted flex items-center justify-center">
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
              </span>
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                s.active ? "text-primary" : s.done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.title}
            </span>
            <span className="text-[11px] text-muted-foreground">{s.detail}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
