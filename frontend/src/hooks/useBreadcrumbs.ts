import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DocumentContext } from "@/context/DocumentContext";
import { getDocumentById, documentNameCache } from "@/api/documents";
import { getRequestById, requestReferenceCache } from "@/api/requests";
import { getSector, getDivision, getOffice } from "@/lib/sectors/sectors-config";

export interface BreadcrumbCrumb {
  label: string;
  to: string;
}

export const toBreadcrumbLabel = (segment: string): string =>
  decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export function useBreadcrumbs(): BreadcrumbCrumb[] {
  const { pathname } = useLocation();
  const docContext = useContext(DocumentContext);
  const documents = docContext?.documents ?? [];

  // Populate cache from loaded documents
  useEffect(() => {
    if (Array.isArray(documents)) {
      for (const doc of documents) {
        if (doc?.id && doc?.name) {
          documentNameCache.set(String(doc.id), doc.name);
        }
      }
    }
  }, [documents]);

  const segments = pathname.split("/").filter(Boolean);

  // Identify any document ID in /new-request/:id
  const newRequestIndex = segments.indexOf("new-request");
  const docId =
    newRequestIndex !== -1 && segments[newRequestIndex + 1]
      ? segments[newRequestIndex + 1]
      : null;

  // Identify any request ID in .../requests/:requestId
  const requestsIndex = segments.indexOf("requests");
  const requestId =
    requestsIndex !== -1 && segments[requestsIndex + 1]
      ? segments[requestsIndex + 1]
      : null;

  // State to trigger re-render once async lookups resolve
  const [docName, setDocName] = useState<string | null>(() =>
    docId ? (documentNameCache.get(docId) ?? null) : null,
  );
  const [refNumber, setRefNumber] = useState<string | null>(() =>
    requestId ? (requestReferenceCache.get(requestId) ?? null) : null,
  );

  // Resolve document name if on /new-request/:id
  useEffect(() => {
    if (!docId) {
      setDocName(null);
      return;
    }

    const cached = documentNameCache.get(docId);
    if (cached) {
      setDocName(cached);
      return;
    }

    const inMemory = documents.find((d) => String(d.id) === docId);
    if (inMemory?.name) {
      documentNameCache.set(docId, inMemory.name);
      setDocName(inMemory.name);
      return;
    }

    let active = true;
    void getDocumentById(docId)
      .then((doc) => {
        if (active && doc?.name) {
          documentNameCache.set(docId, doc.name);
          setDocName(doc.name);
        }
      })
      .catch(() => {
        // Fallback remains if not found
      });

    return () => {
      active = false;
    };
  }, [docId, documents]);

  // Resolve request reference number if on .../requests/:requestId
  useEffect(() => {
    if (!requestId) {
      setRefNumber(null);
      return;
    }

    const cached = requestReferenceCache.get(requestId);
    if (cached) {
      setRefNumber(cached);
      return;
    }

    let active = true;
    void getRequestById(requestId)
      .then((req) => {
        if (active && req?.referenceNumber) {
          requestReferenceCache.set(requestId, req.referenceNumber);
          setRefNumber(req.referenceNumber);
        }
      })
      .catch(() => {
        // Fallback remains if not found
      });

    return () => {
      active = false;
    };
  }, [requestId]);

  if (segments.length === 0) return [{ label: "Dashboard", to: "/" }];

  // Sector segments context if pathname starts with /sectors/
  const isSectorRoute = segments[0] === "sectors";
  const sectorId = isSectorRoute && segments[1] ? segments[1] : null;
  const divisionId = isSectorRoute && segments[2] ? segments[2] : null;
  const officeId = isSectorRoute && segments[3] ? segments[3] : null;

  return segments.map((segment, index) => {
    const prevSegment = index > 0 ? segments[index - 1] : "";
    let to = `/${segments.slice(0, index + 1).join("/")}`;
    let label = toBreadcrumbLabel(segment);

    // 1. If in new-request/:id -> show Document Name instead of ID
    if (prevSegment === "new-request") {
      label = docName ?? documentNameCache.get(segment) ?? "Document Details";
    }
    // 2. If in review (.../requests/:requestId) -> show Reference Number instead of ID
    else if (prevSegment === "requests") {
      label =
        refNumber ?? requestReferenceCache.get(segment) ?? "Review Request";
    }
    // 3. Requests segment in sector review route -> link back to office table
    else if (
      segment === "requests" &&
      isSectorRoute &&
      sectorId &&
      divisionId &&
      officeId
    ) {
      to = `/sectors/${sectorId}/${divisionId}/${officeId}`;
      label = "Requests";
    }
    // 4. Clean Sector / Division / Office labels
    else if (isSectorRoute && index === 1) {
      label = getSector(segment)?.code ?? toBreadcrumbLabel(segment);
    } else if (isSectorRoute && index === 2 && sectorId) {
      label =
        getDivision(sectorId, segment)?.name ?? toBreadcrumbLabel(segment);
    } else if (isSectorRoute && index === 3 && sectorId && divisionId) {
      label =
        getOffice(sectorId, divisionId, segment)?.code ??
        toBreadcrumbLabel(segment);
    }

    return { label, to };
  });
}
