import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const summaryCards = [
  { label: "Total Requests", value: 0 },
  { label: "Pending", value: 0 },
  { label: "Processing", value: 0 },
  { label: "Ready", value: 0 },
];

function MyRequest() {
  return (
    <div className="h-full overflow-auto p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Request</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor student document requests.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className="rounded-xl border bg-card">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-xl border bg-card">
          <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-sm">
              <Input
                type="search"
                placeholder="Search requester or request ID..."
                className="h-9 w-full"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Request Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="pending-payment">Pending Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">Request ID</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Request Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No requests found.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="rounded-xl border border-dashed bg-muted/20 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">View Details</p>
              <p className="text-sm text-muted-foreground">
                Request details panel will be shown here when a request is selected.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-fit">
              View
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyRequest;