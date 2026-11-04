import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Compass,
  FileText,
  Home,
  LogIn,
  PlusCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArchLogo } from "@/components/shared/ArchLogo";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { useAuth } from "@/hooks/useAuth";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user ? "/home" : "/");
    }
  };

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Navigation Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-8">
        <ArchLogo href={user ? "/home" : "/"} size="sm" />
        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-command-menu"))
              }
              className="hidden sm:flex items-center gap-2 rounded-xl border border-input bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Open quick jump"
            >
              <Search className="size-3.5" />
              <span>Quick Jump</span>
              <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                {typeof navigator !== "undefined" &&
                /Mac|iPod|iPhone|iPad/.test(navigator.platform)
                  ? "⌘K"
                  : "Ctrl+K"}
              </kbd>
            </button>
          )}
          <ModeToggle />
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6">
          {/* Badge Icon */}
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Compass
              className="size-10 animate-pulse text-primary"
              aria-hidden="true"
            />
            <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground shadow-xs">
              !
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-mono font-medium text-muted-foreground">
              Error 404 &bull; Page Not Found
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
              Lost in the archive?
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't find the page or document queue you were looking for at:
            </p>
            <div className="mt-1">
              <code className="rounded-md border border-border bg-muted/80 px-2.5 py-1 text-xs font-mono text-foreground break-all inline-block max-w-full">
                {location.pathname}
              </code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoBack}
              className="gap-2 cursor-pointer text-xs sm:text-sm h-10 px-4"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>

            <Button
              asChild
              className="gap-2 cursor-pointer text-xs sm:text-sm h-10 px-5"
            >
              <Link to={user ? "/home" : "/"}>
                <Home className="size-4" />
                {user ? "Back to Dashboard" : "Back to Home"}
              </Link>
            </Button>
          </div>

          {/* Helpful Shortcuts Card */}
          <div className="mt-2 w-full rounded-2xl border border-border/80 bg-card/60 p-4 text-left shadow-xs">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Helpful shortcuts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {user ? (
                <>
                  <Link
                    to="/my-request"
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    <FileText className="size-4 text-primary shrink-0" />
                    <span className="truncate">My Requests</span>
                  </Link>
                  <Link
                    to="/new-request"
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    <PlusCircle className="size-4 text-primary shrink-0" />
                    <span className="truncate">Request Document</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    <LogIn className="size-4 text-primary shrink-0" />
                    <span className="truncate">Sign In</span>
                  </Link>
                  <Link
                    to="/landing"
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    <Home className="size-4 text-primary shrink-0" />
                    <span className="truncate">Landing Portal</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        ARCH &mdash; School Document Management System
      </footer>
    </div>
  );
}

