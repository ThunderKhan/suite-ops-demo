# RoomReady — Taj Santacruz Design System

> **Concept design, 23 October 2026.** Prepared for VSPH's exploratory proposal to Taj Santacruz, Mumbai. This is an independently researched *Taj-inspired* prototype direction, not an official IHCL/Taj brand guide or a claim of approval by the hotel. All demo room, staff, guest, vendor, and stock data must be fictional.

## 0. Design North Star

An understated luxury hotel operations interface: Taj's warm, refined hospitality translated into a calm, fast-scanning command surface. It should feel related to the hotel's visual world without sacrificing the clarity needed by front-desk, housekeeping, maintenance, and purchasing teams.

**Working product name:** RoomReady — Live Room Rack & Housekeeping.

## 1. Design DNA

### Keywords

Art Deco restraint; modern Indian luxury; warm marble; champagne gold; deep ink; ruby accents; disciplined geometry; quiet confidence; precise operational color.

### Emotional character

Composed, elegant, reliable, unhurried visually but quick to operate. A hotel employee should identify a room needing action within seconds. Do not confuse a decorative luxury website with a data-dense staff tool.

### What makes it distinctive

- A seat-selection-like **room rack**, grouped by floor, not a 3D or architectural floor plan.
- A Taj-inspired gold-and-stone framing system surrounding deliberately distinct room-state colors.
- Room tiles with generous numbers, clear state words, optional arrival-time flags, and one-click selection.
- Subtle Art Deco rules and geometric motifs used as separators, never as busy backgrounds behind data.
- A side panel explaining the selected room's status and next authorized action.

### Visual tensions

Luxury versus operational density; warm decorative accents versus precise color semantics; elegant display typography versus compact numerical data; calm atmosphere versus urgent alerts.

## 2. Source References and Confidence

1. **Official hotel website:** https://www.tajhotels.com/en-in/hotels/taj-santacruz-mumbai — describes a double-height lobby, Palatial/Art Deco architecture, chandeliers, filigree and sculpture, modern rooms, and a multicolored Thikri installation. **Observed text.**
2. **Official Taj website:** https://www.tajhotels.com/en-in — restrained presentation, large experiential photography, headings, and gold icon treatments. **Observed page structure and design direction, not exact CSS values.**
3. **Official Taj Santacruz hotel photography:** https://www.tajhotels.com/en-in/hotels/taj-santacruz-mumbai/rooms-and-suites — visible red lounge seating, warm metal and marble tones. **Observed imagery.**
4. **Third-party palette listing:** https://www.schemecolor.com/taj-hotels-resorts-and-palaces-logo-color.php — lists the historical Taj Hotels Resorts and Palaces logo color as `#8E744B`. **Third-party report; not verified as Taj's current production web token.**

### Reference precedence

| Dimension | Primary source |
|---|---|
| Overall tone and brand positioning | Official Taj site |
| Hotel-specific luxury cues | Taj Santacruz site and photos |
| Tentative gold hue | Third-party logo palette, subject to approval |
| Operational layout and interaction | RoomReady product requirements |
| Safety colors, accessibility and task states | Independent application design, not hotel interior colors |

## 3. Core Principles

1. **Scan first.** Room number, state, and urgency must remain readable without opening a detail panel.
2. **Color plus words.** Never encode housekeeping status only by color.
3. **Never mix state dimensions.** Occupancy, housekeeping, and maintenance are separate fields.
4. **Gold is an accent, not a universal status.** Gold frames the brand and important actions; amber marks work underway.
5. **Decoration recedes behind data.** Art Deco patterns belong in headers, separators, or empty states.
6. **No special hardware.** State changes derive from authorized employee activity or future PMS integration, not assumed sensors.
7. **Role-aware actions.** Housekeepers complete cleaning; supervisors pass inspections; reception assigns available rooms.
8. **Purchasing relevance is explicit.** A future stock-consumption and low-inventory panel can connect room turnover to replenishment requests.

## 4. Foundations

### 4.1 Color

**Implementation palette** — exact values below are **suggested design tokens**, except for the third-party reported logo reference; they are not asserted to be official Taj brand specifications.

| Token | Hex | Usage |
|---|---|---|
| `--brand-gold` | `#8E744B` | Provisional logo-inspired gold, fine rules and selected labels |
| `--brand-gold-dark` | `#6C542F` | Accessible emphasized text and solid CTA |
| `--brand-gold-soft` | `#D3C2A5` | Decorative strokes and secondary icons |
| `--brand-ruby` | `#733D43` | Hotel-interior-inspired accent on optional editorial surfaces, not error status |
| `--canvas` | `#F8F6F1` | Application background, warm stone |
| `--surface` | `#FFFEFB` | Room rack and data cards |
| `--surface-alt` | `#F0ECE4` | Inset panels and filters |
| `--ink` | `#29251F` | Main text and dark navigation |
| `--muted` | `#726D64` | Secondary text |
| `--line` | `#E6DED1` | Hairline dividers |

**Operational semantic palette** (custom, distinct from the brand):

| State | Primary | Soft background | Label |
|---|---|---|---|
| Vacant + ready | `#23765B` | `#E6F1EB` | Ready |
| Occupied | `#4B709F` | `#E8EEF7` | Occupied |
| Vacant + dirty | `#BB4E4B` | `#FAE9E7` | Needs cleaning |
| Cleaning | `#A66B19` | `#FAF0DD` | In progress |
| Inspection pending | `#765D9B` | `#F0EAF7` | Awaiting inspection |
| Out of order | `#616565` | `#ECEEEC` | Out of order |

Use the state colors as small bands, dots, pale fills, and pills. Keep text high-contrast. Brand ruby must not compete with the operational red for dirty/urgent rooms.

### 4.2 Typography

- **Editorial headings:** an elegant, restrained serif. Suggested implementation: `Cormorant Garamond` or `Libre Baskerville`; fallback Georgia. These are alternatives, **not verified Taj brand typefaces**.
- **UI and data:** `Manrope` or `Plus Jakarta Sans`, selected for legibility in labels and numerals. Not verified Taj typefaces.
- Hero/section title: 32–44 px / 1.1–1.2; card titles: 18–24 px; room numbers: 26–32 px; operational labels: 12–14 px; metadata: 11–12 px, not tiny decorative gray.
- Monetary values and counts use tabular numerals. Use sentence case for task labels.

### 4.3 Spacing

4 px base. Standard scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Dashboard gutters: 24–32 desktop, 16 mobile. Room tiles need 12–16 padding and no competing elements.

### 4.4 Layout and Grid

- Desktop shell: understated dark or warm neutral left navigation (190–220 px); full remaining width for working data.
- Top hierarchy: property and floor context; room-readiness summary; visual rack; contextual room side panel; prioritized housekeeping queue.
- Main room grid: 5–8 tiles across on large workstations; 3–4 on tablets; 2 on phones.
- Group by floor or wing only as a *logical arrangement*. Do not imply geographic accuracy or draw architectural walls without approved plans.
- Prefer cards that can be scanned from 1–2 meters on a reception display.

### 4.5 Radius, Borders and Shadows

Outer shells 18–24 px; panels 12–16 px; room tiles 10–12 px; pills 999 px. Use ivory/stone hairlines, subtle warm ambient shadows, and a stronger selected-room outline. Avoid heavy glass effects, gradients and hard shadows.

### 4.6 Iconography

Thin-line 18–20 px icons, used sparingly to reinforce labels: bed, broom, checklist, warning, clock, staff. An icon never replaces text for statuses.

## 5. Art Direction

### 5.1 Imagery

Official hotel photography establishes the proposal mood, particularly marble, chandeliers, warm metal, Art Deco lines and ruby-red seating. In the internal application, avoid decorative photos behind room data. Any hotel-owned assets or logos used beyond an internal, clearly labeled concept need permission/brand approval.

### 5.2 Illustration and 3D

No 3D. No literal one-to-one floor plan. A seat-map-like **room rack** is the signature visual; it is a logical list presented as a spatial grid.

### 5.3 Texture and Effects

An occasional 1 px double line or understated geometric border may echo the hotel's Art Deco character. Do not add motifs within status tiles.

### 5.4 Image Treatment

If a cover image is used for the pitch, crop for architectural geometry; let marble and warm lamps establish the tone. Keep dashboard photography out of the primary workspace.

## 6. Components

### Navigation

Dark ink or warm stone rail with wordmark placeholder and clear sections: Overview / Room Rack / Housekeeping / Inventory / Reports. Keep real controls interactive. Do not mimic Taj's public guest navigation in a staff application.

### Buttons

Gold-dark primary for authorized actions; neutral secondary. Critical destructive actions get an explicit confirmation and red treatment. Show disabled states and permission explanations.

### Room Tile

- Anatomy: large room number; status dot and explicit label; optional small occupied/arrival indicator.
- Selected: visible outline plus focus state, not only a different hue.
- Click: opens details; keyboard Enter and Space supported.
- If out of order, selection remains possible but room assignment is disabled.

### KPI Card

Counts for `Ready`, `Needs cleaning`, `In progress`, `Awaiting inspection`, and `Out of order`. Counts derive from real state, not arbitrary animated demo numbers.

### Detail Panel

Selected room number, occupancy, housekeeping condition, maintenance state, assigned cleaner, due/arrival time, latest history, and role-authorized next action.

### Housekeeping Queue

Sort by arrival urgency and SLA, then priority and oldest timestamp. Provide assignment, acceptance, completion, and inspection rejection paths.

### Purchase/Stock Signal (optional concept)

Small card showing `cleaning kits available`, `linen restock alert`, and `replenishment approval needed`. These must be triggered by tracked stock quantities and thresholds, never fabricated automation.

### Forms and Filters

Floor selector; state filter; staff selector; search by room number. Controls remain usable without relying on color.

### Footer/Metadata

Show `Concept prepared by VSPH`, demo-data disclosure, and no claim of integration or Taj endorsement.

## 7. Motion and Interaction

| Event | Motion | Duration | Notes |
|---|---|---:|---|
| Room selected | Outline and subtle elevation | 180–220 ms | Preserve keyboard focus |
| Status update | Background tint transition and small dot change | 250–350 ms | Announce status text change |
| Detail content | 8 px fade/slide | 220 ms | No distracting panel morph |
| New task | Brief highlight then settle | 300–500 ms | Never hide task prioritization |
| Reduced motion | No essential animation | 0 ms | Honor user preference |

Do not continuously pulse every active room. Reserve animation for actual changes and urgent, actionable events.

## 8. Responsive Behavior

- **Desktop:** sidebar, summary, room rack and side detail in a two-column workspace.
- **Tablet:** compact sidebar, fewer rack columns; detail drawer on selection if room grid needs width.
- **Phone:** no dense full dashboard; show `My tasks` first with large accept/start/done controls, followed by a two-column room list. Minimum 44 px touch targets.
- Never force horizontal scrolling through the essential room rack on mobile.

## 9. Page Composition Recipes

1. **Operations overview:** property context → status KPI row → main room rack → selected room panel → housekeeping task queue → optional stock alert.
2. **Housekeeping mobile:** next task → room number & urgency → checklist → primary `Start / Complete` action → next task.
3. **Purchasing extension:** inventory count → at-risk housekeeping supplies → consumption trend → approval queue. Show clear linkage between rooms being prepared and replenishment demand.
4. **Client presentation:** one Taj Santacruz visual establishing context, one complete operational workflow, one live two-screen status-change moment, then measurable proposed KPIs (room turnaround, pending rooms at check-in, replenishment response).

## 10. Content and Copy Presentation

- Use short operational labels: `Room 204`, `Needs cleaning`, `Awaiting inspection`, `Due before 15:00`.
- Avoid marketing language in the staff UI. Editorial language belongs in the pitch: `Every room, accounted for.`
- Never label estimated time as guaranteed without a tracked service-level process.
- Use fictional names and synthetic data for any client-visible demonstration.

## 11. Implementation Tokens

```css
:root {
  --brand-gold: #8E744B;
  --brand-gold-dark: #6C542F;
  --brand-ruby: #733D43;
  --canvas: #F8F6F1;
  --surface: #FFFEFB;
  --surface-alt: #F0ECE4;
  --ink: #29251F;
  --muted: #726D64;
  --line: #E6DED1;
  --ready: #23765B;
  --occupied: #4B709F;
  --dirty: #BB4E4B;
  --cleaning: #A66B19;
  --inspection: #765D9B;
  --out-of-order: #616565;
  --radius-panel: 16px;
  --radius-room: 12px;
  --space-unit: 4px;
}
```

These are suggested prototype tokens; replace the brand subset after Taj/IHCL approves the actual visual identity.

## 12. Do / Don't

| Do | Don't |
|---|---|
| Use champagne gold for selected buttons and brand lines | Make every status gold or burgundy |
| Show large room numbers, color dots and clear labels | Force users to memorize an ambiguous palette |
| Use the rack as a logical room directory | Claim a perfect physical floor plan |
| Integrate stock alerts as a separate extension | Pretend purchasing and housekeeping already share a database |
| State brand colors as provisional until validated | Present third-party hex values as official design tokens |

## 13. Anti-Slop Rules

No purple SaaS gradients; no generic glassmorphism; no stock-illustration dashboard; no random gold icons on every card; no excessive luxury ornament that slows scanning; no invented AI features; no dense fake analytics.

## 14. Accessibility

- Test WCAG AA contrast, especially gold on white and tinted status labels.
- States must have text labels and an optional icon as well as color.
- Live status changes should be announced accessibly when appropriate.
- Provide visible focus, keyboard access, and a reduced-motion setting.
- Use 44 × 44 px minimum mobile touch targets and legible typography at real screen sizes.

## 15. QA Checklist

- [ ] Can reception spot all vacant and ready rooms in less than five seconds?
- [ ] Can an occupied room still be flagged for housekeeping without being offered for check-in?
- [ ] Can a cleaner complete a task without being permitted to self-approve the inspection?
- [ ] Are out-of-order rooms blocked from assignment?
- [ ] Does every room status change show consistently across two clients?
- [ ] Does the interface work without assuming physical room sensors?
- [ ] Are all Taj-like brand values described as provisional, and hotel photos/logos licensed appropriately?
- [ ] Can a purchasing stakeholder see a concrete path from room turnover to stock alerts?
- [ ] Does the mobile workflow prioritize speed over decoration?
- [ ] Are demo numbers and integrations transparently labeled?

## 16. One-Paragraph Prompt

Design RoomReady, a Taj Santacruz-inspired hotel housekeeping and room-readiness application for an exploratory VSPH client proposal. Use warm ivory (`#F8F6F1`), deep ink (`#29251F`), and restrained provisional Taj-like gold (`#8E744B`), with tasteful Art Deco geometry inspired by Taj Santacruz's marble, chandeliers, ruby seating and filigree. Build an airline-seat-map-style room rack grouped by floor, not a real floor plan or 3D scene. Room cards show large numbers, semantic status labels and colors, arrival urgency and selection. Keep occupancy, housekeeping and maintenance distinct. Pair the grid with a room detail drawer, housekeeping queue, mobile cleaner checklist, and optional stock alert for purchasing. Do not claim official Taj branding, integration, or non-demo hotel data. Prioritize high contrast, accessible interactions, and fast operational scanning over ornament.
