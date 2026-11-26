export type PickupType = "self" | "proxy";

export const AUTHORIZED_PROXY_ID_TYPES = [
  "Philippine National ID (PhilID / National ID)",
  "Digital National ID",
  "ePhilID (paper type)",
  "Philippine Passport",
  "Driver's License",
  "UMID (Unified Multi-Purpose ID)",
  "PRC ID (Professional Regulation Commission)",
  "Postal ID",
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

export const MAX_CLAIMANT_NAME_LENGTH = 120;
export const MAX_PROXY_ID_NUMBER_LENGTH = 120;

export const AUTHORIZED_PROXY_ID_NUMBER_PLACEHOLDERS: Record<
  AuthorizedProxyIdType,
  string
> = {
  "Philippine National ID (PhilID / National ID)":
    "Enter PhilSys Card Number (PCN)",
  "Digital National ID": "Enter PhilSys Card Number (PCN)",
  "ePhilID (paper type)": "Enter PhilSys Card Number (PCN)",
  "Philippine Passport": "Enter passport number",
  "Driver's License": "A00-00-000000",
  "UMID (Unified Multi-Purpose ID)": "0000-0000000-0",
  "PRC ID (Professional Regulation Commission)": "Enter PRC license number",
  "Postal ID": "Enter postal ID number",
  "Voter's ID": "Enter voter's ID number",
  "SSS ID": "00-0000000-0",
  "GSIS ID": "Enter BP number",
  "PhilHealth ID": "00-000000000-0",
  "TIN ID (Tax Identification Number)": "000-000-000-000",
  "PWD ID (Person with Disability ID)": "Enter PWD ID number",
  "Senior Citizen ID": "Enter senior citizen ID number",
  "Student ID": "Enter student ID number",
};

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
  };
}

export function formatClaimHandoffProvenance({
  pickupType,
  claimantName,
  idType,
  idNumber,
  notes,
}: {
  pickupType: PickupType;
  claimantName: string;
  idType?: string;
  idNumber?: string;
  notes?: string;
}): string {
  const cleanName = claimantName.trim();
  const cleanIdType = idType ? idType.trim() : "";
  const cleanIdNumber = idNumber ? idNumber.trim() : "";
  const cleanNotes = notes ? notes.trim() : "";

  if (pickupType === "proxy") {
    const idSuffix =
      cleanIdType && cleanIdNumber ? ` (${cleanIdType} #${cleanIdNumber})` : "";
    return `[Counter Release] Claimed by authorized proxy: ${cleanName}${idSuffix}${
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
    } else if (finalClaimant.length > MAX_CLAIMANT_NAME_LENGTH) {
      errors.claimantName = `Claimant name must be at most ${MAX_CLAIMANT_NAME_LENGTH} characters`;
    }
  } else {
    if (!cleanName || cleanName.length < 2) {
      errors.claimantName =
        "Representative full name is required for proxy pickup";
    } else if (cleanName.length > MAX_CLAIMANT_NAME_LENGTH) {
      errors.claimantName = `Representative full name must be at most ${MAX_CLAIMANT_NAME_LENGTH} characters`;
    }
    if (!idType) {
      errors.idType = "Select an ID type for the authorized proxy";
    }
    if (!idNumber) {
      errors.idNumber = "ID number is required for the authorized proxy";
    } else if (idNumber.length > MAX_PROXY_ID_NUMBER_LENGTH) {
      errors.idNumber = `ID number must be at most ${MAX_PROXY_ID_NUMBER_LENGTH} characters`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const remarks = formatClaimHandoffProvenance({
    pickupType: input.pickupType,
    claimantName: finalClaimant,
    idType: input.pickupType === "proxy" ? idType : undefined,
    idNumber: input.pickupType === "proxy" ? idNumber : undefined,
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
