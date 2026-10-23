import type { ChecklistItem, DemoState, HotelRoom, HousekeepingTask, TaskStatus } from "@/lib/types";

export const SAMPLE_DATE = "2026-10-23T09:00:00.000Z";

const checklist = (): ChecklistItem[] => [
  { id: "linen", text: "Replace linen and make the bed", checked: false },
  { id: "bathroom", text: "Sanitise bathroom and surfaces", checked: false },
  { id: "amenities", text: "Replenish guest amenities", checked: false },
  { id: "finish", text: "Final room presentation check", checked: false },
];

export function createChecklist() { return checklist(); }

export function seedState(): DemoState {
  const rooms: HotelRoom[] = [];
  const patterns: Array<Pick<HotelRoom, "occupancy" | "housekeeping" | "maintenance">> = [
    { occupancy: "vacant", housekeeping: "clean", maintenance: "clear" },
    { occupancy: "vacant", housekeeping: "dirty", maintenance: "clear" },
    { occupancy: "occupied", housekeeping: "clean", maintenance: "clear" },
    { occupancy: "vacant", housekeeping: "clean", maintenance: "clear" },
    { occupancy: "vacant", housekeeping: "dirty", maintenance: "clear" },
    { occupancy: "vacant", housekeeping: "in_progress", maintenance: "clear" },
    { occupancy: "vacant", housekeeping: "pending_inspection", maintenance: "clear" },
    { occupancy: "vacant", housekeeping: "clean", maintenance: "out_of_order" },
    { occupancy: "occupied", housekeeping: "clean", maintenance: "clear" },
    { occupancy: "vacant", housekeeping: "clean", maintenance: "clear" },
    { occupancy: "occupied", housekeeping: "dirty", maintenance: "clear" },
    { occupancy: "vacant", housekeeping: "clean", maintenance: "clear" },
  ];

  for (const floor of [2, 3, 4]) {
    for (let index = 0; index < patterns.length; index++) {
      const number = String(floor * 100 + index + 1);
      const pattern = patterns[(index + (floor === 3 ? 3 : floor === 4 ? 6 : 0)) % patterns.length];
      rooms.push({
        id: `room-${number}`, number, floor,
        category: index === 11 ? "Suite" : index >= 8 ? "Luxury" : "Deluxe",
        ...pattern, version: 1,
        arrivalTime: pattern.occupancy === "vacant" && index % 4 === 1 ? "15:00" : undefined,
        lastChanged: SAMPLE_DATE,
      });
    }
  }

  const tasks: HousekeepingTask[] = rooms
    .filter(room => room.occupancy === "vacant" && ["dirty", "in_progress", "pending_inspection"].includes(room.housekeeping))
    .map((room, index) => {
      const mappedStatus: TaskStatus = room.housekeeping === "in_progress" ? "in_progress" : room.housekeeping === "pending_inspection" ? "pending_inspection" : index % 3 === 0 ? "open" : "assigned";
      return {
        id: `task-${room.number}`, roomId: room.id,
        assigneeId: mappedStatus === "open" ? undefined : index % 2 === 0 ? "staff-priya" : "staff-arjun",
        status: mappedStatus,
        priority: room.arrivalTime ? "urgent" : index % 3 === 0 ? "high" : "normal",
        dueAt: room.arrivalTime ? "2026-10-23T10:30:00.000Z" : "2026-10-23T12:00:00.000Z",
        createdAt: SAMPLE_DATE,
        startedAt: mappedStatus === "in_progress" || mappedStatus === "pending_inspection" ? SAMPLE_DATE : undefined,
        checklist: checklist().map(item => ({ ...item, checked: mappedStatus === "pending_inspection" })),
        notes: room.arrivalTime ? "Priority arrival · room expected for afternoon check-in." : "Standard room turnover.",
      };
    });

  return {
    version: 1, rooms, tasks,
    staff: [
      { id: "staff-amara", name: "Amara Mehta", initials: "AM", role: "manager", color: "#98714C" },
      { id: "staff-rohan", name: "Rohan Shah", initials: "RS", role: "front_desk", color: "#7697B9" },
      { id: "staff-priya", name: "Priya Nair", initials: "PN", role: "housekeeper", color: "#956C89" },
      { id: "staff-arjun", name: "Arjun Singh", initials: "AS", role: "housekeeper", color: "#6B917E" },
      { id: "staff-neha", name: "Neha Kapoor", initials: "NK", role: "supervisor", color: "#8B7BAA" },
      { id: "staff-kabir", name: "Kabir Rao", initials: "KR", role: "purchasing", color: "#8D8A57" },
    ],
    inventory: [
      { id: "item-amenity", sku: "AMN-001", name: "Guest amenity kit", category: "Guest essentials", unit: "kits", onHand: 17, reorderAt: 15, targetLevel: 80, cost: 195 },
      { id: "item-linen", sku: "LIN-002", name: "Premium linen set", category: "Housekeeping", unit: "sets", onHand: 42, reorderAt: 20, targetLevel: 90, cost: 890 },
      { id: "item-cleaner", sku: "CLN-003", name: "Surface sanitiser", category: "Cleaning supplies", unit: "bottles", onHand: 24, reorderAt: 10, targetLevel: 48, cost: 320 },
      { id: "item-towel", sku: "LIN-004", name: "Bath towel set", category: "Housekeeping", unit: "sets", onHand: 14, reorderAt: 18, targetLevel: 60, cost: 550 },
      { id: "item-water", sku: "GST-005", name: "Guest water bottles", category: "Guest essentials", unit: "bottles", onHand: 128, reorderAt: 60, targetLevel: 200, cost: 38 },
    ],
    stockMovements: [],
    purchaseRequests: [],
    events: [
      { id: "event-welcome", action: "demo_seeded", description: "Demo property prepared with fictional operational data", actorId: "staff-amara", at: SAMPLE_DATE },
    ],
  };
}
