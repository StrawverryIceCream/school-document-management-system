import type { MissedRequirement } from "../db/schema.js";

export const MAX_MISSED_REQUIREMENTS = 10;
export const MAX_RESUBMIT_TEXT_LENGTH = 2000;
export const MISSED_REQUIREMENT_TYPES = ["file", "text", "textarea"] as const;

type MissedRequirementType = (typeof MISSED_REQUIREMENT_TYPES)[number];

function isMissedRequirementType(value: unknown): value is MissedRequirementType {
  return (
    typeof value === "string" &&
    (MISSED_REQUIREMENT_TYPES as readonly string[]).includes(value)
  );
}

function toUniqueSlug(raw: string, index: number, usedKeys: Set<string>): string {
  const base =
    raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `item-${index + 1}`;

  let candidate = base;
  let suffix = 2;
  while (usedKeys.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  usedKeys.add(candidate);
  return candidate;
}

export function sanitizeMissedRequirements(
  raw: unknown,
): { valid: true; items: MissedRequirement[] } | { valid: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return {
      valid: false,
      error: "Add at least one missed requirement when resubmission is allowed",
    };
  }

  if (raw.length > MAX_MISSED_REQUIREMENTS) {
    return {
      valid: false,
      error: `At most ${MAX_MISSED_REQUIREMENTS} missed requirements can be requested at once`,
    };
  }

  const usedKeys = new Set<string>();
  const items: MissedRequirement[] = [];

  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return { valid: false, error: `Invalid missed requirement at index ${i}` };
    }

    const { key, label, type, required } = entry as Record<string, unknown>;
    const cleanLabel = typeof label === "string" ? label.trim() : "";

    if (!cleanLabel || cleanLabel.length > 120) {
      return {
        valid: false,
        error: "Each missed requirement label must be 1 to 120 characters",
      };
    }

    if (!isMissedRequirementType(type)) {
      return {
        valid: false,
        error: `Invalid type for "${cleanLabel}". Use file, text, or textarea`,
      };
    }

    const rawKey = typeof key === "string" && key.trim() ? key.trim() : cleanLabel;
    items.push({
      key: toUniqueSlug(rawKey, i, usedKeys),
      label: cleanLabel,
      type,
      required: typeof required === "boolean" ? required : true,
    });
  }

  return { valid: true, items };
}

export function validateResubmissionPayload(
  missedRequirements: readonly MissedRequirement[],
  textResponses: Record<string, string>,
  uploadedFileKeys: ReadonlySet<string>,
): { valid: true } | { valid: false; error: string } {
  for (const requirement of missedRequirements) {
    if (requirement.type === "file") {
      if (requirement.required && !uploadedFileKeys.has(requirement.key)) {
        return { valid: false, error: `Please upload "${requirement.label}".` };
      }
      continue;
    }

    const rawAnswer = textResponses[requirement.key];
    const trimmed = typeof rawAnswer === "string" ? rawAnswer.trim() : "";

    if (requirement.required && !trimmed) {
      return { valid: false, error: `Please provide "${requirement.label}".` };
    }

    if (trimmed.length > MAX_RESUBMIT_TEXT_LENGTH) {
      return {
        valid: false,
        error: `"${requirement.label}" must be at most ${MAX_RESUBMIT_TEXT_LENGTH} characters.`,
      };
    }
  }

  return { valid: true };
}
