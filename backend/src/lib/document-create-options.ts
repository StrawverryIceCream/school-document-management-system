export const DOCUMENT_CATEGORIES = ["student", "teacher", "staff"] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

type DocumentCreateOptions = {
  category: DocumentCategory;
  allowedCategories: DocumentCategory[];
  processingDays: number;
  maxCopies: number;
};

type DocumentCreateOptionsResult =
  | { success: true; options: DocumentCreateOptions }
  | { success: false; error: string };

function isDocumentCategory(value: unknown): value is DocumentCategory {
  return (
    typeof value === "string" &&
    DOCUMENT_CATEGORIES.includes(value as DocumentCategory)
  );
}

function parseIntegerOption(
  value: unknown,
  fallback: number,
  minimum: number,
): number | null {
  const parsed =
    value === undefined
      ? fallback
      : typeof value === "number"
        ? value
        : typeof value === "string" && value.trim()
          ? Number(value)
          : Number.NaN;

  return Number.isSafeInteger(parsed) && parsed >= minimum ? parsed : null;
}

export function normalizeDocumentCreateOptions(
  input: Record<string, unknown>,
): DocumentCreateOptionsResult {
  const requestedCategory = input.category;
  if (
    requestedCategory !== undefined &&
    !isDocumentCategory(requestedCategory)
  ) {
    return { success: false, error: "Audience must be student, teacher, or staff" };
  }

  const requestedCategories = input.allowedCategories;
  const categories =
    requestedCategories === undefined
      ? [requestedCategory ?? "student"]
      : requestedCategories;

  if (
    !Array.isArray(categories) ||
    categories.length === 0 ||
    !categories.every(isDocumentCategory)
  ) {
    return {
      success: false,
      error: "Select at least one valid audience",
    };
  }

  const allowedCategories = [...new Set(categories)];
  const category = (requestedCategory ?? allowedCategories[0]) as DocumentCategory;
  if (!allowedCategories.includes(category)) {
    return {
      success: false,
      error: "Primary category must be included in the selected audiences",
    };
  }

  const processingDays = parseIntegerOption(input.processingDays, 3, 0);
  if (processingDays === null) {
    return {
      success: false,
      error: "Turnaround time must be a whole number of 0 or more days",
    };
  }

  const maxCopies = parseIntegerOption(input.maxCopies, 1, 1);
  if (maxCopies === null) {
    return {
      success: false,
      error: "Maximum copies must be a whole number of at least 1",
    };
  }

  return {
    success: true,
    options: { category, allowedCategories, processingDays, maxCopies },
  };
}
