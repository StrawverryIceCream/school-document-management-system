// lib/icon-tones.ts
export const ICON_BOX_BASE =
  "flex shrink-0 items-center justify-center rounded-xl";

export const ICON_TONES = {
  brand: "bg-primary/10 text-primary",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  amber: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  emerald:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200",
  stone: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
} as const;

export type IconTone = keyof typeof ICON_TONES;
