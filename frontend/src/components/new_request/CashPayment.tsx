import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PaymentProof from "./PaymentProof";

interface CashPaymentProps {
  documentName: string;
  feeLabel: string;
  onSubmitProof: (proof: File) => void | Promise<void>;
  onBack: () => void;
}

function CashPayment({
  documentName,
  feeLabel,
  onSubmitProof,
  onBack,
}: CashPaymentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Payment</CardTitle>
        <CardDescription>
          Pay at the school cashier, then submit a photo or scan of your receipt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">{documentName}</p>
          <p className="mt-1 text-muted-foreground">
            Document fee: {feeLabel}
          </p>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Pay the fee at the school cashier.</li>
          <li>Keep the official receipt.</li>
          <li>Take a photo or attach the receipt below.</li>
        </ol>
        <PaymentProof onSubmit={onSubmitProof} onBack={onBack} />
      </CardContent>
    </Card>
  );
}

export default CashPayment;
