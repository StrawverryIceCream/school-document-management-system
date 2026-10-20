type ToneStyles = {
  // Background and glyph color for the square icon box
  icon: string;
  // Filled pill for status and tag badges
  badge: string;
  // Color for large numbers and highlighted text
  value: string;
  // Small status dot that sits inside a badge
  dot: string;
};

// A tone is defined once here, so its icon box, badge, and value can't drift apart
export const TONES = {
  neutral: {
    icon: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
    badge: "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200",
    value: "text-foreground",
    dot: "bg-stone-500",
  },
  brand: {
    icon: "bg-primary/10 text-primary",
    badge: "bg-primary/10 text-primary",
    value: "text-primary",
    dot: "bg-primary",
  },
  rose: {
    icon: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
    badge: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
    value: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-600",
  },
  amber: {
    icon: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    value: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-700",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    // Teal rather than emerald to match the highlighted "ready" count in the mockup
    value: "text-teal-700 dark:text-teal-300",
    dot: "bg-emerald-600",
  },
  sky: {
    icon: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
    badge: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
    value: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-600",
  },
  orange: {
    icon: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200",
    badge: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
    value: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-600",
  },
  red: {
    icon: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    badge: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
    value: "text-destructive",
    dot: "bg-red-600",
  },
} as const satisfies Record<string, ToneStyles>;

export type Tone = keyof typeof TONES;

// Accent bar colors at the top of StatCard matching each tone
export const TONE_TOP_BARS: Record<Tone, string> = {
  neutral: "bg-muted-foreground/40",
  brand: "bg-primary",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  orange: "bg-orange-500",
  red: "bg-destructive",
};

// Shared shapes so every icon box and badge has the same size and rounding
export const ICON_BOX_BASE = "flex shrink-0 items-center justify-center rounded-xl";
export const BADGE_BASE = "gap-2 rounded-full px-3 py-1 text-sm font-semibold";
export const VALUE_BASE = "font-bold leading-none tracking-tight";

// Banner surfaces are full-card backgrounds, which none of the four TONES fields (icon, badge, value, dot) cover, so they get their own map instead of changing the shape of TONES.
export type BannerTone =
  | "crimson"
  | "bronze"
  | "slate"
  | "mauve"
  | "teal"
  | "forest";

export const BANNER_TONES: Record<BannerTone, string> = {
  crimson: "bg-red-900 text-white",
  bronze: "bg-amber-800 text-white",
  slate: "bg-zinc-800 text-white",
  mauve: "bg-stone-700 text-white",
  teal: "bg-teal-800 text-white",
  forest: "bg-emerald-900 text-white",
};