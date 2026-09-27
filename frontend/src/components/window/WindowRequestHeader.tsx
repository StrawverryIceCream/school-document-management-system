import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WindowRequestHeaderProps {
  collegeTitle: string;
  onBack: () => void;
}

function WindowRequestHeader({ collegeTitle, onBack }: WindowRequestHeaderProps) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        style={{ marginBottom: "0.5rem", marginLeft: "-0.5rem" }}
      >
        <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
        Back
      </Button>
      <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>
        {collegeTitle} Requests
      </h1>
      <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
        All document requests submitted by {collegeTitle} students and professors
      </p>
    </div>
  );
}

export default WindowRequestHeader;