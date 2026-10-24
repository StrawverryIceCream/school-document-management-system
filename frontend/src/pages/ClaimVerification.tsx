import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  AlertCircle,
  FileText,
  Loader2,
  PackageCheck,
  Search,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getAllRequests, getRequestById } from "@/api/requests";
import { findOfficeRoute } from "@/lib/sectors/sectors-config";
import type { DocumentRequestWithRelations } from "@/types";

function resolveReviewUrl(req: DocumentRequestWithRelations): string {
  const isCollegeDoc =
    req.documentTypeCode?.toUpperCase().startsWith("COL-") ||
    req.documentType?.officeRecord?.code === "COL";

  const route = findOfficeRoute({
    officeCode: req.documentType?.officeRecord?.code,
    officeId: req.documentType?.officeRecord?.id,
    officeName: req.documentType?.officeRecord?.name,
    sector: req.documentType?.officeRecord?.sector,
    documentTypeCode: req.documentTypeCode,
    college: isCollegeDoc ? req.user?.college?.code : undefined,
  });

  return route
    ? `${route.url}/requests/${req.id}`
    : `/sectors/ovpaa/academic-services/registrar/requests/${req.id}`;
}

export default function ClaimVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const refParam = searchParams.get("ref")?.trim() ?? "";
  const idParam = searchParams.get("id")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedRequest, setMatchedRequest] = useState<DocumentRequestWithRelations | null>(null);
  const [manualRef, setManualRef] = useState(refParam);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`, {
        replace: true,
      });
      return;
    }

    // If a student scanned this, direct them to their portal
    if (user.role === "student") {
      setLoading(false);
      return;
    }

    const queryTarget = refParam || idParam;
    if (!queryTarget) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function resolveRequest() {
      try {
        let req: DocumentRequestWithRelations | null = null;

        if (idParam) {
          try {
            const detail = await getRequestById(idParam);
            req = detail;
          } catch {
            // fallback to search
          }
        }

        if (!req && refParam) {
          const res = await getAllRequests({ search: refParam, limit: 10 });
          const exact = res.data.find(
            (r) => r.referenceNumber.toLowerCase() === refParam.toLowerCase(),
          );
          req = exact ?? res.data[0] ?? null;
        }

        if (!isMounted) return;

        if (!req) {
          setError(`No document request found for "${refParam || idParam}".`);
          setLoading(false);
          return;
        }

        setMatchedRequest(req);
        setLoading(false);

        // If the request is not claimed, automatically redirect staff to review
        if (req.status !== "claimed") {
          const targetUrl = resolveReviewUrl(req);
          navigate(targetUrl, { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while looking up the request.",
        );
        setLoading(false);
      }
    }

    resolveRequest();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, refParam, idParam, navigate]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRef.trim()) return;
    navigate(`/requests/claim?ref=${encodeURIComponent(manualRef.trim())}`);
  };

  // Student scanning view
  if (!authLoading && user?.role === "student") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="size-6" />
            </div>
            <CardTitle>Document Claim Verification</CardTitle>
            <CardDescription>
              This is the official staff QR verification portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please present your claim slip QR code to the releasing officer on duty.
              You can view and manage all your requests in your student portal.
            </p>
            {refParam && (
              <Badge variant="outline" className="font-mono text-sm py-1 px-3">
                {refParam}
              </Badge>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild className="w-full">
              <Link to="/my-request">Go to My Requests</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Loading view
  if (loading || authLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Resolving request tracking reference...
        </p>
      </div>
    );
  }

  // Already claimed view
  if (matchedRequest && matchedRequest.status === "claimed") {
    const targetUrl = resolveReviewUrl(matchedRequest);

    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-amber-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <PackageCheck className="size-6" />
            </div>
            <CardTitle className="text-xl">Document Already Claimed</CardTitle>
            <CardDescription>
              This document has already been picked up and released.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono font-bold">{matchedRequest.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document</span>
                <span className="font-medium">{matchedRequest.documentTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claimed By</span>
                <span className="font-medium">{matchedRequest.claimedBy || "Authorized Student"}</span>
              </div>
              {matchedRequest.claimedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claimed Date</span>
                  <span className="font-medium">
                    {new Date(matchedRequest.claimedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full gap-1.5">
              <Link to={targetUrl}>
                View Request Details <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setMatchedRequest(null);
                setManualRef("");
                navigate("/requests/claim");
              }}
            >
              Scan Another Request
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Not found or manual lookup form
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search className="size-6" />
          </div>
          <CardTitle>Verify Claim Slip</CardTitle>
          <CardDescription>
            Scan a QR code or enter a reference number to verify and process document claim.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualSearch} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="ref-input" className="text-xs font-semibold text-muted-foreground">
                Reference Number (e.g. REQ-2026-000008)
              </label>
              <Input
                id="ref-input"
                placeholder="Enter reference number..."
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Search className="size-4" />
              Search & Verify
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Button variant="ghost" asChild size="sm">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
