// Student ID helpers shared by the signup flow and its input component.

export const STUDENT_ID_PREFIX = "TUPM-";
export const STUDENT_ID_REGEX = /^TUPM-\d{2}-\d{4,5}$/;

export function formatStudentId(value: string): string {
  const digits = value
    .trim()
    .replace(/^TUPM-?/i, "")
    .replace(/\D/g, "")
    .slice(0, 7);

  let formatted = STUDENT_ID_PREFIX;
  if (digits.length > 0) formatted += digits.slice(0, 2);
  if (digits.length > 2) formatted += `-${digits.slice(2, 7)}`;
  return formatted;
}

export function isValidStudentId(value: string): boolean {
  return STUDENT_ID_REGEX.test(value.trim().toUpperCase());
}
