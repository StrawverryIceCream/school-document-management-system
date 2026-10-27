import assert from "node:assert";

export const MAX_PREVIEW_CREDENTIALS = 3;

export function getPreviewCredentials<T>(documents: T[]): T[] {
  return documents.slice(0, MAX_PREVIEW_CREDENTIALS);
}

export interface ArchLogoConfig {
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  showTagline?: boolean;
  href?: string | null;
}

export function resolveLogoClasses(size: "sm" | "md" | "lg" = "md") {
  switch (size) {
    case "sm":
      return {
        iconBox: "size-8 rounded-lg",
        icon: "size-4",
        title: "text-lg",
        badge: "text-xs px-1.5 py-0.5",
        tagline: "text-xs",
      };
    case "lg":
      return {
        iconBox: "size-14 rounded-2xl",
        icon: "size-8",
        title: "text-3xl",
        badge: "text-sm px-2.5 py-1",
        tagline: "text-sm",
      };
    case "md":
    default:
      return {
        iconBox: "size-12 rounded-xl",
        icon: "size-7",
        title: "text-2xl",
        badge: "text-xs px-2 py-0.5",
        tagline: "text-sm",
      };
  }
}

console.log("Running credentials limit & ArchLogo tests...");

// 1. Test preview limit logic
assert.strictEqual(MAX_PREVIEW_CREDENTIALS, 3);
assert.strictEqual(getPreviewCredentials([]).length, 0);
assert.strictEqual(getPreviewCredentials([1, 2]).length, 2);
assert.strictEqual(getPreviewCredentials([1, 2, 3]).length, 3);
assert.strictEqual(getPreviewCredentials([1, 2, 3, 4, 5, 6, 7, 8]).length, 3);
assert.deepStrictEqual(getPreviewCredentials(["TOR", "COR", "TCG", "HD"]), ["TOR", "COR", "TCG"]);

// 2. Test logo class resolution
const sm = resolveLogoClasses("sm");
assert.ok(sm.iconBox.includes("size-8"));
assert.ok(sm.title.includes("text-lg"));

const md = resolveLogoClasses("md");
assert.ok(md.iconBox.includes("size-12"));
assert.ok(md.title.includes("text-2xl"));

const lg = resolveLogoClasses("lg");
assert.ok(lg.iconBox.includes("size-14"));
assert.ok(lg.title.includes("text-3xl"));

console.log("Credentials limit & ArchLogo tests passed!");
