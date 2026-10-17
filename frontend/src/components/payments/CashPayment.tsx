import PaymentProof from "./PaymentProof";

interface CashPaymentProps {
  documentName: string;
  feeLabel: string;
  isRetry: boolean;
  onSubmitProof: (proof: File) => void | Promise<void>;
}

function CashPayment({
  documentName,
  feeLabel,
  isRetry,
  onSubmitProof,
}: CashPaymentProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm">
        <p className="font-medium">{documentName}</p>
        <p className="mt-1 text-muted-foreground">Document fee: {feeLabel}</p>
      </div>
      <ol className="list-decimal space-y-1 pl-5 text-sm">
        <li>Pay the fee at the school cashier.</li>
        <li>Keep the official receipt.</li>
        <li>Take a photo or attach the receipt below.</li>
      </ol>
      <PaymentProof onSubmit={onSubmitProof} isRetry={isRetry} />
    </div>
  );
}

export default CashPayment;
