---
name: Workforce Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#003c36'
  on-tertiary: '#ffffff'
  tertiary-container: '#00554e'
  on-tertiary-container: '#5fcdbf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  gutter: 1rem
  sidebar-width: 16rem
  sidebar-collapsed-width: 4rem
---

## Brand & Style

The design system is engineered for workforce operations, human capital logistics, and operational oversight. It addresses enterprise administrators, cooperative leads, shift supervisors, and payroll officers who require density, clarity, and rapid task completion across critical daily routines.

The aesthetic follows **Corporate / Modern** enterprise discipline:
- **Tone:** Methodical, authoritative, understated, and transparent.
- **Visual Values:** High-density clarity, structured tabular data alignments, crisp border delineation, purposeful color semantics, and zero visual friction.
- **Guiding Rule:** Content and tabular clarity take precedence over decoration. Visual treatments serve orientation, status recognition, and transactional accuracy without unnecessary motion or playful ornamentation.

## Colors

The palette enforces clear functional hierarchy and strict accessibility compliance (WCAG 2.1 AA/AAA) across all enterprise workflows:

- **Primary (`#1E40AF` / `#2563EB`):** Authoritative royal indigo for decisive interactions, focused states, primary buttons, and active navigational tabs.
- **Secondary (`#0F172A`):** Deep charcoal slate for top-tier typography, primary structural headers, and command bars.
- **Tertiary (`#0D9488`):** Deep teal for analytical indicators, secondary metrics, and balanced non-critical data points.
- **Neutral Palette (`#F8FAFC` to `#0F172A`):** 
  - Background Canvas: `#F8FAFC`
  - Elevated Card Surface: `#FFFFFF`
  - Subtle Row Alt / Header Fill: `#F1F5F9`
  - Structural Borders: `#E2E8F0`
  - High-Contrast Borders / Active Inputs: `#CBD5E1`
  - Secondary Text: `#475569`
  - Placeholder & Muted Metadata: `#64748B`

### Status & Feedback Tokens
- **Success (`#059669` / Surface `#ECFDF5` / Border `#A7F3D0`):** Shifts verified, payroll approved, compliant.
- **Warning (`#D97706` / Surface `#FFFBEB` / Border `#FDE68A`):** Overtime approaching, pending acknowledgment, expiring credentials.
- **Critical / Danger (`#DC2626` / Surface `#FEF2F2` / Border `#FECACA`):** Coverage gaps, shift conflict, labor compliance breach.
- **Info (`#0284C7` / Surface `#F0F9FF` / Border `#BAE6FD`):** Schedule updates, memo broadcasts, neutral notifications.

## Typography

This design system standardizes on **Inter** across all UI tiers for optical consistency and numeric precision:

- **Tabular Figures:** All numeric displays (timestamps, headcounts, currencies, wage calculations) must enable open-type tabular numbers (`font-variant-numeric: tabular-nums`) to maintain strict vertical alignment across dense enterprise tables and matrices.
- **Hierarchy Rules:** 
  - `display-lg` is reserved for major dashboard totals, aggregate metrics, and high-level KPI tiles.
  - `headline-md` and `headline-sm` structure section titles, modal headers, and drawer titles.
  - `body-md` (14px) serves as the primary system baseline for form fields, data grid rows, and operational content.
  - `label-sm` (11px, uppercase optional) applies strictly to table column headers, status badges, and metadata tags.

## Layout & Spacing

The layout model is founded on an **8-point linear grid** with a strict 4-point micro-scale for compact enterprise density:

- **Layout Structure:** 
  - Dual-pane enterprise layout: Fixed left navigation sidebar (256px expanded / 64px icon-only), sticky global action header (56px high), and a fluid main workspace with maximum viewport utility.
  - High-density dashboards use fluid multi-column grids (12 columns) with 16px (`1rem`) gutters on desktop, collapsing to 4 columns on mobile viewports.
- **Breakpoints:**
  - **Desktop (Large):** `≥ 1440px` (Full table layouts, split-screen inspectors, multi-panel scheduling).
  - **Desktop (Standard):** `1024px – 1439px` (Collapsible tertiary panels, condensed columns).
  - **Tablet:** `768px – 1023px` (Sidebar shifts to off-canvas drawer, horizontally scrollable data tables).
  - **Mobile:** `< 768px` (Single column cards replace complex matrices; bottom action sheets replace nested modals).
- **Density Ratios:** Standard form padding uses `space-xs` (8px) vertically and `space-sm` (12px) horizontally to ensure rapid scanning without sprawling whitespace.

## Elevation & Depth

Visual hierarchy uses **low-contrast outlines paired with ambient neutral shadows**. The design deliberately avoids heavy multi-color blurs, deep drop shadows, or skeuomorphic bevels:

- **Surface 0 (Base Canvas):** `#F8FAFC` flat surface.
- **Surface 1 (Cards, Data Panels, Drawers):** `#FFFFFF` with a crisp 1px perimeter border (`#E2E8F0`) and an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Surface 2 (Dropdowns, Popovers, Date Pickers):** `#FFFFFF` with a 1px border (`#CBD5E1`) and focused elevation: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Surface 3 (Modals, Slide-over Drawers):** `#FFFFFF` anchored over a backdrop scrim (`rgba(15, 23, 42, 0.45)` with `backdrop-filter: blur(2px)`) and a structured shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.

## Shapes

The design system adheres strictly to a **Soft (`1`)** roundedness scale, providing a restrained, architectural feel appropriate for enterprise governance:

- **Micro Shapes (Badges, Chips, Indicators):** `rounded` (4px / `0.25rem`) for compact tags and status indicators.
- **Standard Controls (Inputs, Buttons, Dropdown triggers):** `rounded-md` (6px / `0.375rem`) for precise clickable boundaries.
- **Containers (Cards, Panels, Modals, Tables):** `rounded-lg` (8px / `0.5rem`) for enclosing boundaries.
- **Pill Rule:** Pill radius (`9999px`) is prohibited except for circular notification counters and user avatars.

## Components

### Buttons
- **Primary:** Background `#1E40AF`, text `#FFFFFF`, 1px border `transparent`. Hover `#1D4ED8`, Active `#1E3A8A`. Focus ring: 2px offset with `#2563EB`.
- **Secondary / Outline:** Background `#FFFFFF`, text `#0F172A`, 1px border `#CBD5E1`. Hover `#F8FAFC` and border `#94A3B8`.
- **Ghost:** Background transparent, text `#475569`. Hover `#F1F5F9`, text `#0F172A`.
- **Destructive:** Background `#DC2626`, text `#FFFFFF`. Hover `#B91C1C`.
- **Sizes:** Small (32px height, 12px font), Medium (38px height, 14px font), Large (44px height, 16px font).

### Data Tables (Workforce Grids)
- **Header Row:** Background `#F8FAFC`, border-bottom 1px solid `#E2E8F0`, typography `label-sm` in `#475569` with sort direction indicators.
- **Body Rows:** Base height 48px (standard) or 40px (compact density). Border-bottom 1px solid `#F1F5F9`. Hover state `#F8FAFC`. Selected state `#EFF6FF` with `#2563EB` 2px left border accent.
- **Numeric Cells:** Right-aligned with tabular numerals enabled.

### Form Inputs & Selects
- **Text Inputs:** Height 38px, background `#FFFFFF`, border 1px solid `#CBD5E1`, border-radius 6px, typography `body-md` (`#0F172A`). Focus state: border `#2563EB`, box-shadow `0 0 0 1px #2563EB`.
- **Error State:** Border `#DC2626`, focus ring `#DC2626`, caption text `#DC2626`.

### Checkboxes & Radio Buttons
- **Base:** 16px × 16px square (checkbox) or circle (radio), 1.5px border `#94A3B8`, background `#FFFFFF`.
- **Checked:** Background `#1E40AF`, border `#1E40AF`, check icon `#FFFFFF`.

### Badges & Status Chips
- **Structure:** Height 22px, padding 2px 8px, border-radius 4px, font `label-sm` (11px, weight 600).
- **Styles:** Subdued tints with 1px border:
  - *Active / Present:* `#ECFDF5` background, `#047857` text, `#A7F3D0` border.
  - *Overtime / Review:* `#FFFBEB` background, `#B45309` text, `#FDE68A` border.
  - *Absent / Breach:* `#FEF2F2` background, `#B91C1C` text, `#FECACA` border.
  - *Draft / Inactive:* `#F1F5F9` background, `#475569` text, `#E2E8F0` border.

### Stepper Components (Onboarding & Payroll Runs)
- Horizontal step lines (2px `#E2E8F0`), active segments `#1E40AF`.
- Step indicators: 28px circles. Completed steps render with `#1E40AF` background and checkmark. Active steps render with `#FFFFFF` background, 2px `#1E40AF` border, and centered indigo dot.

### Interactive Tabs
- **Segmented / Underline:** Horizontal strip with 1px bottom border `#E2E8F0`. Active tab displays 2px `#1E40AF` bottom indicator with text `#1E40AF` (`label-md`). Inactive tabs use `#64748B` with hover to `#0F172A`.

### Cards & Summary KPI Tiles
- Background `#FFFFFF`, border 1px solid `#E2E8F0`, padding 20px, border-radius 8px.
- Metric display: Metric label `label-sm` (`#64748B`), major value `display-lg` (`#0F172A`), delta indicator with paired arrow and percentage chip.