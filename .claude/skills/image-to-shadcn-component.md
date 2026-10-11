---
name: "image-to-shadcn-component"
description: "Turns an image snippet (screenshot, mockup crop, Figma export) into a single drop-in React component built with shadcn/ui and Tailwind for the school/registrar document management system. The component takes no props, reads its data from the project's providers, takes its colors from the shared Tones map in lib/tones.ts, and keeps its types and config in one lib file. Use this skill whenever the user shares an image of a UI piece and says \"make this\", \"make a reusable component\", \"use shadcn for this\", \"turn this into a component\", or \"build this from the screenshot\" -- even if they don't mention props, providers, or this skill by name. Always read school-management-system-coding-style first; this skill only overrides it where stated below.\n"
---

# Image to shadcn component

Turn one image snippet into one component you can render anywhere as `<ComponentName />`.
"Reusable" in this project means drop-in: no wiring, no props, no parent plumbing.

Read `school-management-system-coding-style` first. It is the base for everything here
(shadcn, Tailwind, `@/` aliases, strict TypeScript, no `any`, try/catch on async work,
no magic numbers, complete code with no truncation, ask before installing packages).
The rules below override it only where they conflict.

## Overrides to the base style guide

| Base style guide | This skill |
| --- | --- |
| Presentational components receive props | **No props at all.** Not even `className`. |
| Presentational components use no hooks except `useAuth`/`useTheme` | Components call the project's provider hooks directly |
| Types live in `types/` | Types and config live in one lib file (see below) |
| Pages orchestrate, components render | The component owns its data access and its actions |

## Workflow

### 1. Read the image before touching code

List what is actually there: each visual block, every piece of text, icons, color tones,
and the states you can infer (loading, empty, error, hover). Mockups often contain rendering
bugs, such as an HTML entity printed literally in a price (`&x20B1150.00` should be `₱150.00`).
Fix these silently in the code and mention each fix in the summary.

### 2. Stop and ask about the project, then wait

Never guess at project internals. Before writing code, check the conversation for answers
already given (pasted providers, types, utils). Whatever is missing, ask for it in one short
message and wait for the reply:

1. **Provider and hook** that supply this data. Ask them to paste the context and the hook.
2. **Types** the data uses (for example `DocumentRequest`, `RequestStatus`).
3. **Existing utils and formatters** (date, currency, `cn`, id formatting).
4. **Routes or actions** the buttons and links should trigger.
5. **`lib/tones.ts`**: confirm it exists. If a color in the image has no matching tone, say
   so and propose a new tone entry instead of inventing classes.

If no provider exists for the data, say so and offer to create one with the Context →
Provider → Hook pattern from the base guide. Agree on the data shape first, then write it as
separate files. If the snippet is purely static copy, the data may live in the lib config
instead; confirm that with the user.

### 3. Map the image to shadcn

Compose from `@/components/ui/*`: `Card`, `Badge`, `Button`, `Input`, `Table`, `Tabs`,
`Tooltip`, `Skeleton`, and so on. Do not reimplement them and do not edit files in
`components/ui/`. If a needed shadcn component may not be installed, put the
`npx shadcn@latest add <name>` command in the summary instead of hand-writing it.

### 4. Write exactly two files

**`lib/<kebab-case-component-name>.ts`** holds everything that is not rendering:
types, constants, label maps, status-to-tone maps, page sizes, route builders. Colors are
stored as `Tone` names (`tone: "emerald"`), never as class strings.
Import types the project already has instead of redefining them. Do not touch
`types/index.ts`. The user will split this file up later.

**`components/<domain>/<ComponentName>.tsx`** holds one component:
- `export default function ComponentName()` with an empty parameter list.
- One component per file. No sub-components and no helper functions declared in the file.
  Repeated pieces render inline through `.map` over a config array. Small inline event
  handlers are fine.
- Data comes only from the provider hook. Never receive it, and never drill it down.
  View-only state (open tab, current page) uses `useState` inside the component, unless the
  provider already exposes that state, in which case use the provider's.
- Navigation and actions come from hooks inside the component (`useNavigate` and friends).
- Show the provider's `loading`, `error`, and empty states when it exposes them.
- Use existing utils (`cn` from `@/lib/utils` and any formatter the user pointed to). Write a
  helper into the lib file only when no existing one fits.

### 5. Styling rules

- shadcn components plus Tailwind utility classes only. No inline styles, no CSS files.
- Surfaces and plain text use theme tokens (`text-foreground`, `text-muted-foreground`,
  `bg-card`, `bg-muted`, `bg-primary`, `text-destructive`).
- **Tinted accents come from `TONES` in `@/lib/tones`.** One tone defines a matching set, so
  an icon box, badge, and number of the same tone can never drift apart:

  | Element | Classes |
  | --- | --- |
  | Icon box | `cn(ICON_BOX_BASE, "size-14", TONES[tone].icon)` |
  | Badge or pill | `cn(BADGE_BASE, TONES[tone].badge)` |
  | Status dot inside a badge | `cn("size-2 rounded-full", TONES[tone].dot)` |
  | Highlighted number or text | `cn(VALUE_BASE, "text-5xl", TONES[tone].value)` |

  Never write tint classes (`bg-amber-100`, `text-emerald-800`, `dark:...`) in a component or
  lib file. Type tone fields as `Tone`. Different parts of one element may use different tones
  (an amber icon with a neutral number). If the image needs a color `TONES` lacks, add a new
  entry to `lib/tones.ts` with all four fields (`icon`, `badge`, `value`, `dot`) and mention it
  in the summary.
- **Make text bigger than the image suggests.** Go one step up from what the snippet looks
  like, and never use `text-xs` or `text-[Npx]`. Defaults:

  | Role | Class |
  | --- | --- |
  | Labels, badges, table headers, captions | `text-sm` |
  | Body and secondary text | `text-base` |
  | Row titles, card titles | `text-lg` or `text-xl` |
  | Section titles | `text-2xl` to `text-3xl` |
  | Hero text, stat numbers | `text-4xl` to `text-5xl` |

  Scale icons and padding up with the text so the layout keeps its proportions.
- Accessibility: `aria-hidden` on decorative icons, `aria-label` on icon-only or repeated
  buttons, `role="search"` and similar landmarks where they apply.

### 6. Self-check, then deliver

```
☐ Component signature has no parameters
☐ Only one function declared in the component file
☐ Data comes from the provider hook; nothing is drilled or passed down
☐ Types and config are in the single lib file; nothing added to types/
☐ Existing types and utils were reused, not redefined
☐ Only shadcn components and Tailwind classes; components/ui untouched
☐ Tinted colors come from TONES in lib/tones.ts; no tint classes in the component or lib file
☐ No text-xs or arbitrary text sizes; text is a step larger than the image
☐ Loading, error, and empty states handled where the provider exposes them
☐ Mockup rendering bugs fixed
☐ Complete code, aliases for imports, no `any`, no placeholders
```

Write files under `/mnt/user-data/outputs/frontend/src/` mirroring the project layout, call
`present_files`, then reply with a short list covering: files created, which provider fields
the component reads, anything fixed from the mockup, and assumptions the user should confirm
(route paths, field names such as `createdAt`). Keep it to a list, not long prose.

## Worked example

Image: three stat cards (Total submissions, Active processing, Ready for claiming).
After the user pastes `useMyRequests` exposing `totalCount`, `activeCount`, `readyCount`:

`lib/dashboard-stats.ts`
```ts
import { ClipboardCheck, Folder, Hourglass, type LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/tones";

export type StatKey = "totalCount" | "activeCount" | "readyCount";

type StatConfig = {
  key: StatKey;
  label: string;
  caption: string;
  icon: LucideIcon;
  tone: Tone;
  valueTone: Tone;
};

export const STAT_CONFIGS: StatConfig[] = [
  {
    key: "totalCount",
    label: "Total submissions",
    caption: "All requests this semester",
    icon: Folder,
    tone: "neutral",
    valueTone: "neutral",
  },
  {
    key: "activeCount",
    label: "Active processing",
    caption: "Currently being handled",
    icon: Hourglass,
    tone: "amber",
    valueTone: "neutral",
  },
  {
    key: "readyCount",
    label: "Ready for claiming",
    caption: "Claim slip validated and stamped",
    icon: ClipboardCheck,
    tone: "emerald",
    valueTone: "emerald",
  },
];
```

`components/dashboard/DashboardStats.tsx`
```tsx
import { Card } from "@/components/ui/card";
import { useMyRequest } from "@/hooks/useMyRequest";
import { STAT_CONFIGS } from "@/lib/dashboard-stats";
import { ICON_BOX_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function DashboardStats() {
  const counts = useMyRequest();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STAT_CONFIGS.map(({ key, label, caption, icon: Icon, tone, valueTone }) => (
        <Card key={key} className="flex-row items-start justify-between rounded-2xl border-0 px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className={cn(VALUE_BASE, "text-5xl", TONES[valueTone].value)}>{counts[key]}</span>
            <span className="text-base text-muted-foreground">{caption}</span>
          </div>
          <div className={cn(ICON_BOX_BASE, "size-14", TONES[tone].icon)}>
            <Icon className="size-6" aria-hidden="true" />
          </div>
        </Card>
      ))}
    </div>
  );
}
```

Note the shape: no props, one function, data from the hook, config in the lib file holding `Tone`
names, colors resolved through `TONES`, text a step larger.
The captions above are illustrative; in real use, take caption text from the image.
