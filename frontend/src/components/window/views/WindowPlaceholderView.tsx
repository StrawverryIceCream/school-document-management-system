import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type WindowPlaceholderViewProps = {
  title: string;
  onBack?: () => void;
};

export default function WindowPlaceholderView({
  title,
  onBack,
}: WindowPlaceholderViewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
      </CardHeader>
      <div className="px-6 pb-6 text-sm text-muted-foreground">
        Content for this view isn’t built yet.
      </div>
    </Card>
  );
}
