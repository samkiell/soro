# Soro Design System

**Status:** Proposed baseline for implementation  
**Product:** Soro Campus Safety & Incident Reporting System  
**Visual direction:** Calm, clear, trustworthy, accessible, mobile-first

This document locks the first-release design tokens and shared interface rules. Use it alongside [ARCHITECTURE.md](./ARCHITECTURE.md). The PRD defines product requirements; this file defines visual and interaction consistency.

## 1. Design principles

1. **Clarity before decoration.** Keep the next action obvious, especially when a student is stressed.
2. **Calm by default.** Use neutral surfaces and a restrained blue/teal accent. Reserve strong colors for urgency and destructive actions.
3. **Mobile-first.** Core flows must work on small screens and weak connections.
4. **Accessible by default.** Use visible focus, clear labels, keyboard support, readable type, and more than color alone to communicate status.
5. **Honest feedback.** Never imply that a report was sent, a call was placed, or an emergency team was alerted unless that action actually happened.
6. **Consistent patterns.** Use shared components instead of recreating buttons, inputs, badges, and dialogs on every page.

## 2. Color tokens

Use CSS custom properties in HSL-compatible values if that matches the installed shadcn/ui setup. The hex values below are the canonical design references. If the codebase uses shadcn's `--background`, `--foreground`, `--primary`, and related variables, map these tokens to those variables rather than introducing a second competing color system.

### Core palette

| Token | Hex | Use |
|---|---|---|
| Brand / primary | `#1D4ED8` | Primary actions, active navigation, links |
| Brand hover | `#1E40AF` | Hover and pressed primary actions |
| Brand tint | `#EFF6FF` | Selected surfaces, subtle information panels |
| Accent / teal | `#0F766E` | Secondary emphasis, supportive highlights |
| Accent tint | `#F0FDFA` | Calm informational backgrounds |
| Page background | `#F8FAFC` | App canvas |
| Surface | `#FFFFFF` | Cards, forms, dialogs |
| Surface muted | `#F1F5F9` | Subtle panels and disabled surface backgrounds |
| Border | `#E2E8F0` | Dividers, input borders, card outlines |
| Border strong | `#CBD5E1` | Higher-emphasis outlines |
| Text primary | `#0F172A` | Headings and primary content |
| Text secondary | `#475569` | Body supporting text |
| Text muted | `#64748B` | Hints and metadata; do not use for essential low-contrast text |
| White | `#FFFFFF` | Text on dark/brand surfaces where contrast is sufficient |

### Semantic colors

| Token | Hex | Meaning |
|---|---|---|
| Success | `#15803D` | Confirmed success, resolved state |
| Success tint | `#F0FDF4` | Success message backgrounds |
| Warning | `#B45309` | Caution and elevated urgency |
| Warning tint | `#FFFBEB` | Warning backgrounds |
| Danger | `#B91C1C` | Critical urgency, destructive action, failure |
| Danger tint | `#FEF2F2` | Error and critical alert backgrounds |
| Info | `#1D4ED8` | Neutral information and guidance |
| Info tint | `#EFF6FF` | Informational backgrounds |

Semantic color indicates meaning, not decoration. Pair status colors with text labels or icons. Do not rely on color alone.

### Incident urgency mapping

- **Low:** neutral slate badge, label “Low”.
- **Medium:** blue badge, label “Medium”.
- **High:** amber badge, label “High”.
- **Critical:** red badge, label “Critical”.

### Report status mapping

- **Received:** blue or slate badge, label “Received”.
- **In progress:** amber badge, label “In progress”.
- **Resolved:** green badge, label “Resolved”.

Keep status colors distinct from buttons and do not use a red page-wide treatment for every incident. Red is reserved for genuinely critical states and destructive actions.

## 3. Typography

Use **Inter** if the project can load it reliably; otherwise use a system sans-serif stack to avoid making first render depend on an external font request.

- Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Base font size: `16px`
- Body line height: `1.5`
- Heading line height: `1.2`
- Default text weight: `400`
- Emphasized text: `500` or `600`
- Avoid using font weight `700` for every heading.

| Token | Size | Typical use |
|---|---:|---|
| `text-xs` | 12px | Secondary metadata only |
| `text-sm` | 14px | Helper text, compact table details |
| `text-base` | 16px | Default body and form controls |
| `text-lg` | 18px | Lead text and card headings |
| `text-xl` | 20px | Section headings |
| `text-2xl` | 24px | Page heading on small screens |
| `text-3xl` | 30px | Page heading on wider screens |
| `text-4xl` | 36px | Landing-page hero heading, only where appropriate |

Do not shrink form labels, critical instructions, or status information to fit a layout. Prefer wrapping or stacking.

## 4. Spacing and layout

Use Tailwind's default 4px-based spacing scale. Do not add arbitrary one-off spacing values unless a layout genuinely requires them.

| Token | Value | Use |
|---|---:|---|
| `space-1` | 4px | Icon-to-label micro spacing |
| `space-2` | 8px | Tight related elements |
| `space-3` | 12px | Form label to field |
| `space-4` | 16px | Standard element spacing |
| `space-6` | 24px | Card content and grouped fields |
| `space-8` | 32px | Section separation |
| `space-12` | 48px | Large section separation |
| `space-16` | 64px | Landing-page section spacing |

- Main content max width: `1200px`.
- Reading/form column max width: `720px`; use a narrower form width when it improves completion.
- Page horizontal padding: `16px` on mobile, `24px` on medium screens, `32px` on wide screens.
- Dashboard layout: simple single-column mobile layout; sidebar navigation may appear on wider screens.
- Forms: single column by default. Only place fields side by side when their relationship and mobile behavior remain clear.
- Keep the emergency action and key contact information near the top of the emergency page.

## 5. Shape, borders, and elevation

| Token | Value | Use |
|---|---|---|
| Small radius | `6px` | Badges, compact controls |
| Default radius | `8px` | Inputs, buttons, cards |
| Large radius | `12px` | Larger cards and dialogs |
| Pill radius | `9999px` | Status badges and small chips only |
| Border width | `1px` | Standard outlines and separators |

- Prefer bordered surfaces over heavy shadows.
- Use a subtle shadow only for elevated dialogs, menus, or floating elements.
- Do not add gradients, glass effects, decorative blobs, or excessive card nesting.
- A card should group related content, not simply wrap every individual element.

## 6. Component tokens and behavior

### Buttons

- Minimum interactive height: `44px` on touch-oriented interfaces.
- Primary: brand blue background with accessible white text.
- Secondary: white or muted background with border.
- Destructive: danger color for destructive actions only.
- Ghost: transparent until hover/focus; use for low-emphasis actions.
- Include visible hover, focus-visible, active, disabled, and loading states.
- Prevent accidental duplicate submissions while a request is in progress.
- Use action-specific labels such as “Submit report” rather than vague labels such as “Continue” when the action is final.

### Inputs and forms

- Minimum height: `44px`.
- Always show a persistent label. Placeholder text is not a label.
- Display validation feedback next to the relevant field and connect it programmatically to the input.
- Explain why sensitive fields are needed where the purpose may not be obvious.
- Mark required and optional fields consistently.
- Preserve entered values when validation fails.
- Provide a clear summary or focus behavior when server validation errors prevent submission.
- The report description should support comfortable multi-line entry.

### Cards and report rows

- Use white surfaces, a subtle border, and consistent padding.
- Surface the report title, status, urgency, location or date as appropriate, and a clear route to details.
- On small screens, convert wide tables into stacked rows or cards rather than forcing horizontal scrolling for core tasks.
- Do not show another student's identifying information in student-facing views.

### Badges

- Use compact, readable labels with enough padding.
- Always include text for urgency and report status.
- Keep status and urgency as separate fields; do not combine them into one ambiguous badge.

### Alerts and confirmations

- Place the message close to the action or content it describes.
- State what happened and what the user should do next.
- Use confirmation dialogs for destructive or difficult-to-reverse actions, not for every ordinary click.
- Do not expose internal stack traces or database errors to users.

### Navigation

- Keep primary navigation short and predictable.
- Clearly distinguish the active destination.
- Use text labels alongside icons where an icon alone would be ambiguous.
- Keep student and admin navigation visibly distinct.
- Provide a clear route back from report details to the report list.

## 7. Page-specific direction

- **Landing page:** explain what Soro does, offer a clear “Report an incident” action, and link to emergency information. Avoid implying that Soro replaces emergency services.
- **Login and registration:** focused layout, minimal distractions, visible labels, clear password feedback, and accessible error messages.
- **Student dashboard:** show the user's reports, status, submission date, and a prominent new-report action. Include a helpful empty state.
- **New report:** short, single-column flow; group incident details logically; make anonymity behavior explicit before submission; make photo upload optional.
- **Report details:** show current status and chronological student-visible updates. Never show admin-only notes to students.
- **Emergency information:** prioritize actionable instructions, verified contacts, and clear calling links. Keep critical content visible without unnecessary scrolling.
- **Admin overview:** prioritize report volume and actionable queues; do not use decorative charts that add no decision value.
- **Admin report management:** clear filters, status controls, timestamps, and explicit separation between public updates and internal notes.

## 8. Responsive breakpoints

Use Tailwind's default breakpoints unless the implementation demonstrates a real need to change them:

- Base: below `640px`, single-column layouts.
- `sm`: `640px`
- `md`: `768px`
- `lg`: `1024px`
- `xl`: `1280px`

Test at narrow mobile widths, tablet widths, and desktop. Avoid fixing the layout to one laptop viewport.

## 9. Accessibility baseline

- Target WCAG 2.2 AA where applicable.
- Normal text contrast should be at least 4.5:1; large text contrast at least 3:1.
- Interactive controls and meaningful graphical indicators must have sufficient contrast.
- All interactive elements must be keyboard accessible with a visible focus indicator.
- Use semantic headings in order, explicit form labels, and accessible names for icon buttons.
- Announce asynchronous success and error feedback appropriately.
- Respect reduced-motion preferences and keep animation minimal.
- Never use color as the only indicator of urgency, status, validity, or selection.
- Do not disable browser zoom or rely on hover-only interactions.

## 10. Motion and feedback

- Keep transitions subtle, generally around 150–200ms.
- Animate only to clarify state changes or provide feedback.
- Respect `prefers-reduced-motion`.
- Use skeletons only where they meaningfully communicate loading; otherwise use simple loading text or indicators.
- Every async action needs a visible pending state and a clear success or error outcome.

## 11. Iconography and imagery

- Use one consistent icon set, preferably the icon library already installed with shadcn/ui.
- Icons must not replace important action labels.
- Do not use stock imagery as decoration on safety-critical workflows.
- Uploaded incident images must have appropriate alt text when informative, and decorative images must use empty alt text.
- Use neutral illustrations sparingly and only when they improve understanding.

## 12. Design token implementation

Map these choices into the existing Tailwind and shadcn/ui configuration. Prefer a single source of truth via CSS custom properties and semantic utility classes such as `bg-background`, `text-foreground`, `bg-primary`, `border-border`, and `text-muted-foreground`.

Do not scatter raw hex values throughout components. If a new semantic color is required, add it to this document and the central token definition first.

Before declaring the design system implemented, verify:
- [ ] Light theme tokens are mapped to the UI framework.
- [ ] Buttons, inputs, cards, badges, alerts, and dialogs use shared styles.
- [ ] Focus, hover, disabled, loading, success, and error states are implemented.
- [ ] Mobile layouts have been checked.
- [ ] Contrast has been checked for text and controls.
- [ ] Status and urgency remain understandable without color.

## 13. Change control

These tokens are the baseline for the first release. If the team proposes a new palette, typography system, or component convention, update this document and central token configuration in the same pull request. Avoid local design overrides that silently create a second system.
