# Suite Operations Demo

A concept hospitality operations dashboard exploring how reception, housekeeping, floor supervisors and purchasing teams can share a clearer view of room readiness. Created for an exploratory VSPH solution proposal.

> **Independent prototype.** The sample property is Taj Santacruz, Mumbai, but the dashboard is neither commissioned by nor endorsed by Taj/IHCL. All names, room records, staff, inventory quantities, costs and activity are fictional. There is no hotel PMS, reservation, supplier or payment integration. Logo assets are original placeholders; hotel photography is not copied.

## What you can demonstrate

- Visual, airline-seat-map-inspired room rack, grouped by logical floor.
- Room status separated into **occupancy**, **housekeeping** and **maintenance** (an occupied-clean room is not ready for check-in).
- Manager task assignment → cleaner checklist → supervisor inspection → ready-for-assignment state.
- Front desk manual check-in and checkout simulation with guardrails.
- Role-aware actions, activity history and simulated version conflicts.
- Stock usage recorded against an active housekeeping task; threshold-based alerts and mock purchase approvals.
- Responsive operations dashboard and phone-first housekeeping screens.
- Browser-tab synchronization through `BroadcastChannel`, with localStorage persistence and a deterministic reset.

The role picker in the top-right corner **simulates** permissions within a local demo. It is not real authentication or security; never enter actual guest, vendor, room or employee data.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Routes:

- `/overview` — room grid, statuses, detail panel, task queue, latest activity.
- `/my-tasks` — housekeeping assignments and consumables usage.
- `/inspections` — approval/rejection and rework loop.
- `/inventory` — stock health, internal purchase requests and consumption history.

No `.env` file is needed for the **browser-only prototype**. Configuring Supabase credentials alone does not enable a live multi-device backend; that is a separate integration milestone. The proposed normalized database schema is provided in `supabase/migrations/001_initial.sql` as groundwork for that stage.

## Demonstration script

1. Open **Overview** as *Rohan Shah (Front desk)* and record checkout for an occupied room without an active cleaning task.
2. Switch to *Amara Mehta (Operations manager)*, select that room and assign its cleaning task to *Priya Nair*.
3. Switch to *Priya Nair (Housekeeping)*, open **Housekeeping**, start cleaning, check all items, and record use of **2 guest amenity kits**.
4. Submit the room for inspection, then switch to *Neha Kapoor (Supervisor)* and approve it.
5. Return to **Overview**: the vacant, clean, maintenance-clear room is now **Ready**.
6. Switch to *Kabir Rao (Purchasing)* and open **Inventory**. See the reduced amenity count and new low-stock alert; create and approve a mock purchase request.

Choose `Reset demo` in the footer to restore the original fictional data.

## Project structure

```text
src/
  app/                 Route pages and design tokens
  components/          Responsive operations, housekeeping and purchasing views
  lib/
    types.ts           Typed room, task, inventory and role models
    seed.ts            Fictional room and stock data
    room-status.ts     Derived status and assignability
    workflow.ts        Pure role-authorized transition engine
    demo-context.tsx   Browser persistence and cross-tab updates
docs/
  IMPLEMENTATION_PLAN.md
  DESIGN.md
supabase/migrations/    Planned normalized database schema
tests/                  Pure state transition tests
```

## Design direction

Warm ivory, deep ink, understated provisional gold, editorial serif typography and restrained Art Deco details—without sacrificing operational color semantics. The approximate gold `#8E744B` is **not an official validated Taj web token**. Approval is required for official branding, photography and any real integration.

## Known limitations and next phase

The current app is designed as a **client-safe, self-contained browser demonstration**. It is not suitable for real hotel use: users can switch roles, the browser controls state, and different physical devices do not share one authoritative database. For an actual pilot we would provision Supabase (or integrate the hotel's existing PMS), add authenticated server-side role enforcement, atomic database transitions, audit retention and real-time subscriptions with refetch fallback. See `docs/IMPLEMENTATION_PLAN.md` for that architecture.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Private discovery notes, credentials and client details must never be committed to this public repository.
