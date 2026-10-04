import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function PaymentConfirmation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payment Verification</CardTitle>
        <CardDescription>
          Your payment has been submitted for verification. You can check your
          request status in My Requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The current system keeps the request in Pending status. Payment proof
          and verification status are not saved by the backend yet.
        </p>
        <Button asChild>
          <Link to="/my-request">Go to My Requests</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default PaymentConfirmation;
