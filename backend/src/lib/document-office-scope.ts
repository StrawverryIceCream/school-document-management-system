export interface DocumentOfficeRef {
  code: string;
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
  officeCode?: string | null;
}

export interface OfficeActorRef {
  id: string;
  role: "student" | "teacher" | "admin" | "staff";
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
  officeCode?: string | null;
}

export interface DocumentUpdatePayloadRef {
  code?: unknown;
  office?: unknown;
  officeId?: unknown;
}

function legacyOfficeToCode(office?: "registrar" | "hr" | null): string | null {
  if (office === "hr") return "HRMO";
  if (office === "registrar") return "OUR";
  return null;
}

function extractPrefixCode(code?: string | null): string | null {
  const trimmed = code?.trim() ?? "";
  // Use the last hyphen so hyphenated office codes like TLO-ITSO-001 keep their full prefix.
  const dashIdx = trimmed.lastIndexOf("-");
  if (dashIdx > 0) {
    const prefix = trimmed.slice(0, dashIdx).trim().toUpperCase();
    return prefix || null;
  }
  return null;
}

export function resolveDocumentOfficeCode(doc: DocumentOfficeRef): string | null {
  const explicit = doc.officeCode?.trim().toUpperCase();
  if (explicit) return explicit;
  const fromCode = extractPrefixCode(doc.code);
  if (fromCode) return fromCode;
  return legacyOfficeToCode(doc.office);
}

export function resolveStaffOfficeCode(
  actor: Pick<OfficeActorRef, "office" | "officeCode"> | null | undefined,
): string | null {
  if (!actor) return null;
  const explicit = actor.officeCode?.trim().toUpperCase();
  if (explicit) return explicit;
  return legacyOfficeToCode(actor.office);
}

export function isDocumentInStaffOffice(
  doc: DocumentOfficeRef,
  actor: OfficeActorRef | null | undefined,
): boolean {
  if (!actor) return false;
  if (actor.role === "admin") return true;
  if (actor.role !== "staff") return false;

  const docOfficeId = doc.officeId?.trim() || null;
  const actorOfficeId = actor.officeId?.trim() || null;
  if (docOfficeId && actorOfficeId) {
    return docOfficeId === actorOfficeId;
  }

  const docCode = resolveDocumentOfficeCode(doc);
  const actorCode = resolveStaffOfficeCode(actor);
  return Boolean(docCode && actorCode && docCode === actorCode);
}

export function canStaffManageDocument(
  doc: DocumentOfficeRef,
  actor: OfficeActorRef | null | undefined,
): boolean {
  return isDocumentInStaffOffice(doc, actor);
}

export function hasCrossOfficeReassignmentAttempt(
  existingDoc: DocumentOfficeRef,
  patch: DocumentUpdatePayloadRef,
  actor: OfficeActorRef | null | undefined,
): boolean {
  if (actor?.role === "admin") return false;
  if (!actor || actor.role !== "staff") return true;

  const actorOfficeId = actor.officeId?.trim() || null;
  const existingOfficeId = existingDoc.officeId?.trim() || null;

  if (patch.officeId !== undefined) {
    if (patch.officeId !== null && typeof patch.officeId !== "string") {
      return true;
    }
    const requestedOfficeId =
      typeof patch.officeId === "string" ? patch.officeId.trim() || null : null;
    if (actorOfficeId && requestedOfficeId !== actorOfficeId) {
      return true;
    }
    if (!actorOfficeId && requestedOfficeId !== existingOfficeId) {
      return true;
    }
  }

  if (patch.office !== undefined && patch.office !== existingDoc.office) {
    return true;
  }

  if (typeof patch.code === "string") {
    const nextCode = patch.code.trim().toUpperCase();
    const currentCode = existingDoc.code?.trim().toUpperCase() ?? "";
    if (nextCode && nextCode !== currentCode) {
      const existingCode = resolveDocumentOfficeCode(existingDoc);
      const nextPrefix = extractPrefixCode(patch.code);
      if (existingCode && nextPrefix && nextPrefix !== existingCode) {
        return true;
      }
    }
  }

  return false;
}
