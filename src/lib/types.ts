export type Role = "manager" | "front_desk" | "housekeeper" | "supervisor" | "purchasing";
export type Occupancy = "vacant" | "occupied";
export type Housekeeping = "clean" | "dirty" | "in_progress" | "pending_inspection";
export type Maintenance = "clear" | "out_of_order";
export type TaskStatus = "open" | "assigned" | "in_progress" | "pending_inspection" | "completed" | "needs_rework";
export type Priority = "normal" | "high" | "urgent";
export type PurchaseStatus = "pending" | "approved" | "rejected";

export interface StaffMember { id: string; name: string; role: Role; initials: string; color: string }
export interface HotelRoom {
  id: string;
  number: string;
  floor: number;
  category: "Deluxe" | "Luxury" | "Suite";
  occupancy: Occupancy;
  housekeeping: Housekeeping;
  maintenance: Maintenance;
  version: number;
  arrivalTime?: string;
  lastChanged: string;
}
export interface ChecklistItem { id: string; text: string; checked: boolean }
export interface HousekeepingTask {
  id: string;
  roomId: string;
  assigneeId?: string;
  status: TaskStatus;
  priority: Priority;
  dueAt?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  checklist: ChecklistItem[];
  notes: string;
}
export interface InventoryItem { id: string; name: string; sku: string; category: string; unit: string; onHand: number; reorderAt: number; targetLevel: number; cost: number }
export interface StockMovement { id: string; itemId: string; taskId: string; quantity: number; actorId: string; createdAt: string }
export interface PurchaseRequest { id: string; itemId: string; quantity: number; status: PurchaseStatus; requestedBy: string; createdAt: string; decidedBy?: string; decidedAt?: string; note: string }
export interface ActivityEvent { id: string; roomId?: string; action: string; description: string; actorId: string; at: string }
export interface DemoState {
  version: number;
  rooms: HotelRoom[];
  staff: StaffMember[];
  tasks: HousekeepingTask[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  purchaseRequests: PurchaseRequest[];
  events: ActivityEvent[];
}
export type DemoCommand =
  | { type: "checkout"; roomId: string; expectedVersion: number }
  | { type: "checkin"; roomId: string; expectedVersion: number }
  | { type: "assign"; taskId: string; staffId: string }
  | { type: "start"; taskId: string; expectedVersion: number }
  | { type: "checklist"; taskId: string; itemId: string }
  | { type: "submit"; taskId: string; expectedVersion: number }
  | { type: "inspect"; taskId: string; approved: boolean; reason?: string; expectedVersion: number }
  | { type: "maintenance"; roomId: string; outOfOrder: boolean; expectedVersion: number }
  | { type: "consume"; taskId: string; itemId: string; quantity: number }
  | { type: "purchase"; itemId: string; quantity: number; note: string }
  | { type: "decidePurchase"; requestId: string; approved: boolean };
