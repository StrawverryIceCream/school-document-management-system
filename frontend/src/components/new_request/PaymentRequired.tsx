import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PaymentRequiredProps {
  documentName: string;
  feeLabel: string;
  onCash: () => void;
  onOnline: () => void;
}

function PaymentRequired({
  documentName,
  feeLabel,
  onCash,
  onOnline,
}: PaymentRequiredProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Required</CardTitle>
        <CardDescription>
          Choose how you would like to pay before continuing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border p-4">
          <p className="font-medium">{documentName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Document fee: {feeLabel}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={onCash}>
            Cash
          </Button>
          <Button onClick={onOnline}>Online</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentRequired;
