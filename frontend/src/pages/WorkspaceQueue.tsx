import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueueTable, { type QueueItem } from "@/components/workspace/QueueTable";
import { Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceQueue() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("pending");
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedOffice =
    searchParams.get("officeCode") ||
    user?.department ||
    (user as any)?.officeCode ||
    "OUR";

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/requests/workspace-queue?officeCode=${encodeURIComponent(
          selectedOffice,
        )}&tab=${encodeURIComponent(activeTab)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedOffice, activeTab]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
            <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {selectedOffice}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Incoming student requests requiring administrative review, fee assessment, and processing.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchQueue}
          disabled={loading}
          className="self-start md:self-auto"
        >
          <RefreshCw
            className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex md:grid-cols-4">
          <TabsTrigger value="pending">Pending Evaluation</TabsTrigger>
          <TabsTrigger value="processing">In Processing</TabsTrigger>
          <TabsTrigger value="action_required">Action Required</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
        </TabsList>
      </Tabs>

      <QueueTable items={items} loading={loading} />
    </div>
  );
}
