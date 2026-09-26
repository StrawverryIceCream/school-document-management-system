import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindowView } from "@/hooks/useWindowView";

type WindowPlaceholderViewProps = {
  title: string;
};

function WindowPlaceholderView({ title }: WindowPlaceholderViewProps) {
  const { clearView } = useWindowView();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="outline" onClick={clearView}>
          Back
        </Button>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing) text-sm text-muted-foreground">
        Content for this view isn't built yet.
      </div>
    </Card>
  );
}

export default WindowPlaceholderView;
