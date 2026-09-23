import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PlaceholderViewProps = {
  title: string;
  onBack: () => void;
};

function PlaceholderView({ title, onBack }: PlaceholderViewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing) text-sm text-muted-foreground">
        Content for this view isn't built yet.
      </div>
    </Card>
  );
}

export default PlaceholderView;