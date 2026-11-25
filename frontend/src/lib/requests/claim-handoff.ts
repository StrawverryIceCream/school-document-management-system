export type PickupType = "self" | "proxy";

export const AUTHORIZED_PROXY_ID_TYPES = [
  "Voter's ID",
  "SSS ID",
  "GSIS ID",
  "PhilHealth ID",
  "TIN ID (Tax Identification Number)",
  "PWD ID (Person with Disability ID)",
  "Senior Citizen ID",
  "Student ID",
] as const;

export type AuthorizedProxyIdType = (typeof AUTHORIZED_PROXY_ID_TYPES)[number];

export interface ClaimHandoffDetails {
  pickupType: "proxy";
  fullName: string;
  idType: AuthorizedProxyIdType;
  idNumber: string;
}

export interface ClaimHandoffInput {
  pickupType: PickupType;
  claimantName: string;
  studentName?: string;
  notes?: string;
  idType?: string;
  idNumber?: string;
}

export interface ClaimHandoffResult {
  valid: boolean;
  errors: {
    claimantName?: string;
    idType?: string;
    idNumber?: string;
  };
  data?: {
    claimedBy: string;
    remarks: string;
    handoffDetails?: ClaimHandoffDetails;
  };
}

export function formatClaimHandoffProvenance({
  pickupType,
  claimantName,
  notes,
}: {
  pickupType: PickupType;
  claimantName: string;
  notes?: string;
}): string {
  const cleanName = claimantName.trim();
  const cleanNotes = notes ? notes.trim() : "";

  if (pickupType === "proxy") {
    return `[Counter Release] Claimed by authorized proxy: ${cleanName}${
      cleanNotes ? `. Verification: ${cleanNotes}` : ""
    }`;
  }

  return `[Counter Release] Claimed by student (Self)${
    cleanNotes ? `. Verification: ${cleanNotes}` : ""
  }`;
}

export function validateClaimHandoff(
  input: ClaimHandoffInput,
): ClaimHandoffResult {
  const errors: ClaimHandoffResult["errors"] = {};
  const cleanName = input.claimantName.trim();
  const cleanNotes = (input.notes || "").trim();
  const defaultStudent = (input.studentName || "").trim();
  const idType = AUTHORIZED_PROXY_ID_TYPES.find(
    (authorizedIdType) => authorizedIdType === input.idType,
  );
  const idNumber = (input.idNumber || "").trim();

  let finalClaimant = cleanName;

  if (input.pickupType === "self") {
    if (!finalClaimant) {
      finalClaimant = defaultStudent;
    }
    if (!finalClaimant) {
      errors.claimantName = "Student name is required";
    }
  } else {
    // Proxy pickup requires non-empty proxy name and verification notes
    if (!cleanName || cleanName.length < 2) {
      errors.claimantName =
        "Representative full name is required for proxy pickup";
    }
    if (!idType) {
      errors.idType = "Select an ID type for the authorized proxy";
    }
    if (!idNumber) {
      errors.idNumber = "ID number is required for the authorized proxy";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const remarks = formatClaimHandoffProvenance({
    pickupType: input.pickupType,
    claimantName: finalClaimant,
    notes: cleanNotes,
  });
  const handoffDetails: ClaimHandoffDetails | undefined =
    input.pickupType === "proxy"
      ? {
          pickupType: "proxy",
          fullName: finalClaimant,
          idType: idType!,
          idNumber,
        }
      : undefined;

  return {
    valid: true,
    errors: {},
    data: {
      claimedBy: finalClaimant,
      remarks,
      ...(handoffDetails ? { handoffDetails } : {}),
    },
  };
}
