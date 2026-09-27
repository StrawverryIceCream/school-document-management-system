interface WindowPlaceholderViewProps {
  title: string;
}

function WindowPlaceholderView({ title }: WindowPlaceholderViewProps) {
  return (
    <div style={{ padding: "2.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
      {title}
    </div>
  );
}

export default WindowPlaceholderView;