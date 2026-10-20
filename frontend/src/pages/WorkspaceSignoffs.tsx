import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileCheck, CheckCircle2, AlertTriangle, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";

export interface RoutingStepItem {
  id: string;
  requestId: string;
  stepOrder: number;
  stepType: string;
  status: "pending" | "approved" | "action_required" | "locked" | "rejected";
  remarks?: string | null;
  createdAt: string;
  office?: {
    id: string;
    code: string;
    name: string;
  };
  request?: {
    id: string;
    referenceNumber: string;
    documentTypeCode: string;
    documentTypeName: string;
    user?: {
      fullName: string;
      email: string;
      studentId?: string;
    };
  };
}

export default function WorkspaceSignoffs() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"pending" | "action_required" | "approved">("pending");
  const [steps, setSteps] = useState<RoutingStepItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const selectedOffice =
    searchParams.get("officeCode") ||
    user?.department ||
    (user as any)?.officeCode ||
    "OUR";

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/requests/routing-steps?officeCode=${encodeURIComponent(
          selectedOffice,
        )}&status=${encodeURIComponent(activeTab)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSteps(data.items || []);
      } else {
        setSteps([]);
      }
    } catch {
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSteps();
  }, [selectedOffice, activeTab]);

  const handleApprove = async (step: RoutingStepItem) => {
    setActingId(step.id);
    try {
      const res = await fetch(`/api/requests/${step.requestId}/steps/${step.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: "Approved by clearance officer" }),
      });
      if (res.ok) {
        toast.success("Clearance step approved");
        fetchSteps();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to approve step");
      }
    } catch {
      toast.error("Network error while approving step");
    } finally {
      setActingId(null);
    }
  };

  const handleDeficiency = async (step: RoutingStepItem) => {
    const reason = window.prompt("Enter deficiency reason for student:");
    if (!reason) return;

    setActingId(step.id);
    try {
      const res = await fetch(`/api/requests/${step.requestId}/steps/${step.id}/deficiency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: reason }),
      });
      if (res.ok) {
        toast.warning("Deficiency flagged. Request placed on hold.");
        fetchSteps();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to flag deficiency");
      }
    } catch {
      toast.error("Network error while flagging deficiency");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Clearance & Sign-Offs</h1>
            <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {selectedOffice}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Sign off student clearance prerequisites, laboratory accountability, and academic department approvals.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSteps}
          disabled={loading}
          className="self-start md:self-auto"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="pending">Pending Sign-Offs</TabsTrigger>
          <TabsTrigger value="action_required">Deficiencies</TabsTrigger>
          <TabsTrigger value="approved">Approved History</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <Clock className="mr-2 size-5 animate-spin" />
          Loading clearance sign-off queue...
        </div>
      ) : steps.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="font-medium">No clearance steps in this view</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Clearance steps routed to {selectedOffice} will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Reference</TableHead>
                <TableHead>Student / Requester</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Step Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((step) => (
                <TableRow key={step.id}>
                  <TableCell className="font-mono font-medium">
                    {step.request?.referenceNumber || "REQ-..."}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium leading-none">
                      {step.request?.user?.fullName || "Student"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {step.request?.user?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{step.request?.documentTypeName}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground font-mono">
                      [{step.request?.documentTypeCode}]
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    Step {step.stepOrder} ({step.office?.code || selectedOffice})
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        step.status === "approved"
                          ? "default"
                          : step.status === "action_required"
                          ? "destructive"
                          : "outline"
                      }
                      className="capitalize font-normal"
                    >
                      {step.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {step.status === "pending" && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={actingId === step.id}
                          onClick={() => handleApprove(step)}
                          className="h-8 gap-1.5"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Approve Step
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={actingId === step.id}
                          onClick={() => handleDeficiency(step)}
                          className="h-8 gap-1.5"
                        >
                          <AlertTriangle className="size-3.5" />
                          Flag Deficiency
                        </Button>
                      </div>
                    )}
                    {step.status !== "pending" && (
                      <span className="text-xs text-muted-foreground">
                        {step.remarks || "No remarks"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
