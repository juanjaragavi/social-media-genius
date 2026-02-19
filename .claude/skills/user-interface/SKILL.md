---
name: user-interface
description: Interaction design standards, responsive layout rules, component-level UX specifications, navigation patterns, animation guidelines, and chart/data visualization conventions for TopNetworks properties. Use when designing or implementing any interactive UI element, layout system, or data display.
---

# User Interface — TopNetworks, Inc.

This skill governs interaction design, layout systems, and component-level UX across all TopNetworks properties. It complements `brand-identity` (visual language) and `frontend` (technical implementation). Standards are derived from production implementations across route-genius (SaaS dashboard), topfinanzas-us-next (content platform), and budgetbee-next (consumer app).

---

## Scope

**Use for:** Responsive layouts, navigation design, interactive states, animation patterns, data visualization, form UX, loading states, empty states, error UI, modal/dialog design, and accessibility interaction patterns.

**Not for:** Color tokens and typography (see `brand-identity`), technical component code (see `frontend`), or API/backend logic (see `backend`).

---

## Layout System

### Breakpoints (Tailwind Mobile-First)

Always design mobile-first. Apply responsive modifiers for larger breakpoints:

| Breakpoint       | Prefix | Min-width | Use case                      |
| ---------------- | ------ | --------- | ----------------------------- |
| Mobile (default) | (none) | 0px       | Base styles — all devices     |
| Small            | `sm:`  | 640px     | Landscape phones              |
| Medium           | `md:`  | 768px     | Tablets, desktop navigation   |
| Large            | `lg:`  | 1024px    | Desktop, side-by-side layouts |
| Extra Large      | `xl:`  | 1280px    | Wide desktop                  |

```html
<!-- Example: responsive layout -->
<div class="flex flex-col md:flex-row gap-4 md:gap-8">
  <main class="w-full md:w-2/3">...</main>
  <aside class="w-full md:w-1/3">...</aside>
</div>
```

### Content Width Standards

```html
<!-- Full-bleed section -->
<section class="w-full">
  <!-- Contained content (standard) -->
  <div class="container mx-auto px-4">
    <!-- Narrow content (articles, forms) -->
    <div class="max-w-4xl mx-auto">
      <!-- Very narrow (forms only) -->
      <div class="max-w-2xl mx-auto">
        <!-- Wide content (dashboards) -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
    </div>
  </div>
</section>
```

### Page Layout Patterns

**Content Platform (TopFinanzas / BudgetBee / KardTrust):**

```
Header (sticky)
├── Hero section (full-bleed)
├── Content area (max-w-4xl, single column)
│   ├── H1
│   ├── Ad unit #1
│   ├── Article sections
│   ├── Ad unit #2
│   └── CTA
└── Footer
```

**SaaS Dashboard (RouteGenius):**

```
Root layout
├── DashboardNav (left sidebar on desktop, top bar on mobile)
└── Main content area
    ├── Page header (breadcrumbs + actions)
    ├── Content (cards, tables, charts)
    └── Pagination / empty state
```

---

## Navigation

### Header (Content Platforms)

```typescript
// Standard header — sticky, white background, shadow on scroll
<header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <Link href="/" className="flex items-center gap-2">
        <Image src={logo} alt="TopFinanzas" width={140} height={32} priority />
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        {/* Desktop navigation */}
      </nav>
      <button className="md:hidden" aria-label="Open menu">
        {/* Mobile hamburger */}
      </button>
    </div>
  </div>
</header>
```

### Dashboard Navigation (RouteGenius)

```typescript
// Left sidebar on desktop, collapses to top bar on mobile
// Components: DashboardNav.tsx
// Always shows: Logo, nav links, user avatar + sign out
// Active link: highlighted with bg-blue-50 text-blue-600 border-l-2 border-blue-600

<nav className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed">
  <div className="p-4 border-b">
    <Image src={logo} alt="RouteGenius" width={140} height={32} />
  </div>
  <div className="flex-1 py-4">
    {navItems.map((item) => (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors",
          isActive(item.href)
            ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <item.icon className="w-4 h-4" />
        {item.label}
      </Link>
    ))}
  </div>
</nav>
```

---

## Interactive States

Every interactive element must have all four states:

```css
/* Button interactive states */
.btn-primary {
  /* Default */
  background: #2563eb;
  color: white;
  /* Hover */
  background: #1d4ed8;
  (blue-700)/*Active/press*/background: #1e40af;
  transform: scale(0.98);
  /* Disabled */
  opacity: 0.5;
  cursor: not-allowed;
  /* Focus */
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

Tailwind pattern:

```html
<button
  class="bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
>
  Label
</button>
```

---

## Form UX Standards

### Multi-Step Forms (Credit Card Quizzes / Recommenders)

Critical behavior rules:

1. **Always scroll to top** when advancing steps: `window.scrollTo(0, 0)`
2. Show a `<ProgressIndicator>` with step count and visual progress bar
3. Persist state in both `localStorage` AND cookies (dual storage)
4. Never lose user's progress on browser refresh
5. Back navigation must restore the previous step's values

```typescript
// Progress indicator pattern
<div className="w-full bg-gray-200 rounded-full h-2 mb-6">
  <div
    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
  />
</div>
<p className="text-sm text-gray-500 text-center mb-4">
  Step {currentStep} of {totalSteps}
</p>
```

### Input Fields

```html
<!-- Standard text input -->
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Label <span class="text-red-500">*</span>
  </label>
  <input
    type="text"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
           placeholder:text-gray-400"
    placeholder="Placeholder text"
  />
  <!-- Error state -->
  <p class="mt-1 text-sm text-red-600">Error message</p>
</div>
```

Validation feedback:

- Show errors below the input, in `text-red-600`
- Border changes to `border-red-500` on error
- Success state: `border-green-500` (optional, use sparingly)
- Never show errors before user has interacted with the field

---

## Loading States

```typescript
// Skeleton loader — matches the layout of the content it replaces
function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4 rounded-lg bg-white border border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

// Spinner — for actions with loading state
function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        size === "sm" && "w-4 h-4",
        size === "md" && "w-6 h-6",
        size === "lg" && "w-8 h-8"
      )}
    />
  );
}
```

Rules:

- Skeleton loaders must match the visual footprint of the content they replace
- Spinners are for button-triggered actions; skeletons are for page sections
- Loading state duration: if ≥300ms expected, show skeleton immediately; if <300ms, debounce the skeleton to avoid flash

---

## Empty States

```typescript
// Empty state — for dashboard sections with no data
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

---

## Modal & Dialog Design

Use Radix UI `Dialog` (via shadcn/ui). Never create custom modal implementations.

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    <p className="text-sm text-gray-600">
      Description of the action and its consequences.
    </p>
    <DialogFooter className="gap-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleConfirm}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Destructive actions (delete, archive) require a confirmation dialog before execution.

---

## Notifications & Toast

Use `sonner` for toast notifications:

```typescript
import { toast } from "sonner";

// Success
toast.success("Project created successfully");

// Error
toast.error("Failed to save changes. Please try again.");

// Loading (async)
const toastId = toast.loading("Saving...");
// After completion:
toast.success("Saved", { id: toastId });
// Or on error:
toast.error("Failed to save", { id: toastId });
```

Toast rules:

- Success: `toast.success()` — auto-dismisses after 4 seconds
- Error: `toast.error()` — persistent until dismissed or 8 seconds
- Never use `alert()` or `confirm()` — use Radix Dialog for confirmation, sonner for notifications

---

## Animation Standards

Use `framer-motion` for meaningful transitions. Keep animations functional — they should communicate state change, not decorate.

```typescript
import { motion, AnimatePresence } from "framer-motion";

// Page transition
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

<motion.div variants={pageVariants} initial="initial" animate="animate">
  {children}
</motion.div>

// List item entrance
const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2 },
  }),
};

// Stagger list
{items.map((item, i) => (
  <motion.div
    key={item.id}
    custom={i}
    variants={itemVariants}
    initial="hidden"
    animate="visible"
  >
    <ItemCard item={item} />
  </motion.div>
))}
```

Animation rules:

- Duration: 150–250ms for micro-interactions, 200–350ms for page transitions
- Easing: ease-out for entrances, ease-in for exits
- **Respect `prefers-reduced-motion`** — wrap all animations in motion-safe media queries:

```typescript
const shouldAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)")
  .matches;
// Or in Tailwind: motion-reduce:transition-none motion-reduce:animate-none
```

---

## Data Visualization (Recharts)

Used in route-genius analytics dashboard. All charts use `recharts`:

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Brand colors for chart series
const CHART_COLORS = {
  primary: "#2563eb",   // blue-600
  secondary: "#0891b2", // cyan-600
  accent: "#84cc16",    // lime-500
  warning: "#f59e0b",   // amber-500
  muted: "#9ca3af",     // gray-400
};

// Standard chart wrapper
<div className="bg-white rounded-xl border border-gray-100 p-4">
  <h3 className="text-sm font-semibold text-gray-700 mb-4">Chart Title</h3>
  <ResponsiveContainer width="100%" height={240}>
    <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
      <Tooltip
        contentStyle={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      />
      <Line
        type="monotone"
        dataKey="clicks"
        stroke={CHART_COLORS.primary}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4, fill: CHART_COLORS.primary }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
```

Four chart types used in route-genius:

1. **ClicksLineChart** — daily click trends (LineChart)
2. **DestinationPieChart** — click distribution by URL (PieChart)
3. **CountryBarChart** — geographic distribution (BarChart, horizontal)
4. **HourlyBarChart** — clicks by hour of day (BarChart, vertical)

---

## Card Design

```typescript
// Standard card
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between mb-3">
    <div>
      <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
      {badge}
    </span>
  </div>
  <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
    {actions}
  </div>
</div>
```

---

## Tables

```typescript
// Data table pattern — responsive with horizontal scroll on mobile
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-gray-100">
        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {rows.map((row) => (
        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
          <td className="py-3 px-4 text-gray-700">{row.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## Responsive Image Cropping (Avatar Upload)

Route-genius implements a cropping modal for avatar uploads:

```typescript
// AvatarCropModal.tsx pattern:
// 1. User selects file → preview in <img> element
// 2. Crop region selection (click + drag)
// 3. Canvas extraction of cropped region
// 4. Blob → POST to /api/profile/avatar
// 5. GCS returns URL → update user.image in DB
```

---

## Constraints

- Never use `alert()`, `confirm()`, or `prompt()` — use Radix Dialog
- Never use inline `style={{}}` — use Tailwind classes
- Never use absolute pixel values for spacing — use Tailwind's spacing scale
- Minimum touch target size: 44×44px (WCAG 2.5.5 AAA — aim for this even at AA level)
- Never animate layout properties (`width`, `height`, `top`, `left`) — use `transform` and `opacity` only for performance
- All destructive actions require confirmation dialog before execution
- All async button actions must show loading state while pending
- Form errors must be announced to screen readers via `role="alert"` or `aria-live="polite"`
- Never hide content with `visibility: hidden` on focus — use `sr-only` for screen-reader-only text
