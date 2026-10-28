export type PickupType = "self" | "proxy";

export interface ClaimHandoffInput {
  pickupType: PickupType;
  claimantName: string;
  studentName?: string;
  notes?: string;
}

export interface ClaimHandoffResult {
  valid: boolean;
  errors: {
    claimantName?: string;
    notes?: string;
  };
  data?: {
    claimedBy: string;
    remarks: string;
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
  const errors: { claimantName?: string; notes?: string } = {};
  const cleanName = input.claimantName.trim();
  const cleanNotes = (input.notes || "").trim();
  const defaultStudent = (input.studentName || "").trim();

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
    if (!cleanNotes || cleanNotes.length < 3) {
      errors.notes =
        "Authorization ID / Letter verification notes are required for proxy pickup";
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

  return {
    valid: true,
    errors: {},
    data: {
      claimedBy: finalClaimant,
      remarks,
    },
  };
}
