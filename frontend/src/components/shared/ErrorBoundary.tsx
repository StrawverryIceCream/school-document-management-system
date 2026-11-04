import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error in component tree:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 text-foreground">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred while loading this view.
            </p>
            {this.state.error?.message && (
              <pre className="mt-4 max-h-32 w-full overflow-auto rounded-lg bg-muted p-3 text-left font-mono text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="mr-2 size-4" />
                Reload
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/home";
                }}
              >
                <Home className="mr-2 size-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

