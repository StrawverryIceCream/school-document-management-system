import type { User } from "@/types";
import type { OfficeConfig } from "./sectors-config";

export function filterOfficeStaff<T extends Pick<User, "id" | "officeId" | "office">>(
  staffList: T[],
  office: Pick<OfficeConfig, "id" | "code">,
): T[] {
  const matching = staffList.filter(
    (s) =>
      s.officeId === office.id ||
      (s.office && s.office.toLowerCase() === office.code.toLowerCase()),
  );
  return matching.length > 0 ? matching : staffList;
}
