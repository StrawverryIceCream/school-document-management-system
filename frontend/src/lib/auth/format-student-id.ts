// Student ID helpers shared by the signup flow and its input component.

export const STUDENT_ID_PREFIX = "TUPM-";

export function formatStudentId(value: string): string {
  const digits = value
    .replace(/^TUPM-?/, "")
    .replace(/\D/g, "")
    .slice(0, 6);

  let formatted = "TUPM-";
  if (digits.length > 0) formatted += digits.slice(0, 2);
  if (digits.length > 2) formatted += `-${digits.slice(2, 6)}`;
  return formatted;
}