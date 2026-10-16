import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPeso } from "@/lib/format";
import { TONES } from "@/lib/tones";

interface PaymentConfirmationProps {
  receiptNumber: string | null;
  amount: string;
  paymentRequired: boolean;
  message: string | null;
}

function PaymentConfirmation({
  receiptNumber,
  amount,
  paymentRequired,
  message,
}: PaymentConfirmationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2
            className={`size-5 ${TONES.emerald.value}`}
            aria-hidden="true"
          />
          {paymentRequired ? "Payment Submitted" : "Request Submitted"}
        </CardTitle>
        <CardDescription>
          {paymentRequired
            ? "Your payment has been submitted for verification. You can check your request status in My Requests."
            : "Your request has been submitted. You can check its status in My Requests."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentRequired && receiptNumber && (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">Receipt Number</p>
            <p className="mt-1 font-mono text-muted-foreground">
              {receiptNumber}
            </p>
            <p className="mt-3 font-medium">Amount</p>
            <p className="mt-1 text-muted-foreground">
              {formatPeso(Number(amount))}
            </p>
          </div>
        )}
        {paymentRequired && (
          <p className="text-sm text-muted-foreground">
            Your payment proof has been uploaded and is pending staff verification.
            You will receive a notification once verification is complete.
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
        <Button asChild>
          <Link to="/my-request">Go to My Requests</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default PaymentConfirmation;
