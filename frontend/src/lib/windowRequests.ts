import type { RequestStatus } from "@/types";

export const WINDOW_REQUEST_PAGE_SIZE = 6;

export const REQUEST_STATUS_OPTIONS: {
  id: RequestStatus;
  label: string;
}[] = [
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "ready", label: "Ready for release" },
  { id: "claimed", label: "Claimed" },
  { id: "cancelled", label: "Cancelled" },
];

export const REQUEST_WINDOWS = [
  { id: "all", label: "All Windows" },
  { id: "window-1", label: "Window 1 (Registrar)" },
  { id: "window-2", label: "Window 2 (Registrar 2)" },
  { id: "window-3", label: "Window 3 (Registrar 3)" },
  { id: "window-4", label: "Window 4 (Registrar 4)" },
  { id: "window-5", label: "Window 5 (Registrar 5)" },
  { id: "window-6", label: "Window 6 (Registrar 6)" },
] as const;

export type RequestWindow = (typeof REQUEST_WINDOWS)[number]["id"];

const COLLEGE_WINDOWS: Record<string, Exclude<RequestWindow, "all">> = {
  cos: "window-1",
  "college of science": "window-1",
  coe: "window-2",
  "college of engineering": "window-2",
  cafa: "window-3",
  "college of architecture and fine arts": "window-3",
  cmms: "window-4",
  "college of management & multidisciplinary studies": "window-4",
  cit: "window-5",
  "college of information technology": "window-5",
  cie: "window-6",
  "college of industrial education": "window-6",
};

export function getRequestWindowForCollege(collegeName: string | null | undefined) {
  const college = collegeName?.trim().toLowerCase();
  return college ? (COLLEGE_WINDOWS[college] ?? "window-1") : "window-1";
}
