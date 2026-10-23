import type { HotelRoom, Housekeeping, DemoState } from "@/lib/types";

export type DisplayStatus = "ready" | "occupied" | "dirty" | "cleaning" | "inspection" | "blocked";

export const statusMeta: Record<DisplayStatus, { label: string; short: string; tone: string }> = {
  ready: { label: "Ready", short: "Ready", tone: "ready" },
  occupied: { label: "Occupied", short: "Occupied", tone: "occupied" },
  dirty: { label: "Needs cleaning", short: "Dirty", tone: "dirty" },
  cleaning: { label: "In progress", short: "Cleaning", tone: "cleaning" },
  inspection: { label: "Awaiting inspection", short: "Inspection", tone: "inspection" },
  blocked: { label: "Out of order", short: "Blocked", tone: "blocked" },
};

export function statusForRoom(room: HotelRoom): DisplayStatus {
  if (room.maintenance === "out_of_order") return "blocked";
  if (room.occupancy === "occupied") return "occupied";
  const map: Record<Housekeeping, DisplayStatus> = { clean: "ready", dirty: "dirty", in_progress: "cleaning", pending_inspection: "inspection" };
  return map[room.housekeeping];
}

export function isAssignable(room: HotelRoom): boolean {
  return room.occupancy === "vacant" && room.housekeeping === "clean" && room.maintenance === "clear";
}

export function roomCounts(rooms: HotelRoom[]) {
  return rooms.reduce((counts, room) => {
    counts[statusForRoom(room)] += 1;
    return counts;
  }, { ready: 0, occupied: 0, dirty: 0, cleaning: 0, inspection: 0, blocked: 0 } as Record<DisplayStatus, number>);
}

export function activeTaskForRoom(state: DemoState, roomId: string) {
  return state.tasks.find(task => task.roomId === roomId && task.status !== "completed");
}

export function housekeepingLabel(value: Housekeeping): string {
  return { clean: "Clean & inspected", dirty: "Needs cleaning", in_progress: "Cleaning underway", pending_inspection: "Awaiting inspection" }[value];
}
