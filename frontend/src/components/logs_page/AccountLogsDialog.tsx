import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLogs } from "@/hooks/useLogs";
import { formatDate } from "@/lib/utils";
import { FileText, CreditCard, UserCog, FileClock } from "lucide-react";
import type { ActivityLog } from "@/context/LogsContext";

const logTypeIcon: Record<ActivityLog["type"], typeof FileText> = {
  request: FileClock,
  payment: CreditCard,
  account: UserCog,
  document: FileText,
};

function AccountLogsDialog() {
  const { selectedAccount, accountLogs, logsLoading, logsError, closeAccountLogs } =
    useLogs();

  const open = selectedAccount !== null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeAccountLogs()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {selectedAccount ? `Activity Logs — ${selectedAccount.fullName}` : "Activity Logs"}
          </DialogTitle>
          <DialogDescription>All recorded activity for this account.</DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {logsLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Loading logs...
            </p>
          ) : logsError ? (
            <p className="text-sm text-destructive py-6 text-center">{logsError}</p>
          ) : accountLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No activity recorded yet.
            </p>
          ) : (
            accountLogs.map((log) => {
              const Icon = logTypeIcon[log.type] ?? FileText;
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 border-b pb-3 last:border-b-0"
                >
                  <div className="mt-0.5 rounded-full bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{log.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {log.type}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AccountLogsDialog;
