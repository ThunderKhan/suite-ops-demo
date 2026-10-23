import { createChecklist } from "@/lib/seed";
import { isAssignable } from "@/lib/room-status";
import type { DemoCommand, DemoState, HotelRoom, Role, StaffMember } from "@/lib/types";

export class WorkflowError extends Error {
  constructor(message: string, public code: string = "INVALID_TRANSITION") { super(message); this.name = "WorkflowError"; }
}

const id = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now = () => new Date().toISOString();

export function applyCommand(current: DemoState, command: DemoCommand, actorId: string): DemoState {
  const next: DemoState = structuredClone(current);
  const actor = next.staff.find(person => person.id === actorId);
  if (!actor) throw new WorkflowError("Select a valid demo account first.", "UNAUTHORIZED");

  const requireRole = (...roles: Role[]) => {
    if (!roles.includes(actor.role)) throw new WorkflowError(`This action requires ${roles.join(" or ")} access.`, "FORBIDDEN");
  };
  const roomById = (roomId: string) => {
    const room = next.rooms.find(item => item.id === roomId);
    if (!room) throw new WorkflowError("Room not found.", "NOT_FOUND");
    return room;
  };
  const taskById = (taskId: string) => {
    const task = next.tasks.find(item => item.id === taskId);
    if (!task) throw new WorkflowError("Task not found.", "NOT_FOUND");
    return task;
  };
  const checkVersion = (room: HotelRoom, expected: number) => {
    if (room.version !== expected) throw new WorkflowError("This room changed in another view. Refresh the details and try again.", "CONFLICT");
  };
  const roomChanged = (room: HotelRoom) => { room.version += 1; room.lastChanged = now(); };
  const record = (action: string, description: string, roomId?: string) => {
    next.events.unshift({ id: id(), action, description, roomId, actorId, at: now() });
    next.events = next.events.slice(0, 100);
  };
  const assignedCleaner = (task: { assigneeId?: string }) => {
    requireRole("housekeeper");
    if (task.assigneeId !== actor.id) throw new WorkflowError("This task is assigned to another cleaner.", "FORBIDDEN");
  };

  switch (command.type) {
    case "checkout": {
      requireRole("front_desk");
      const room = roomById(command.roomId); checkVersion(room, command.expectedVersion);
      if (room.occupancy !== "occupied") throw new WorkflowError("Only occupied rooms can be checked out.");
      if (next.tasks.some(task => task.roomId === room.id && task.status !== "completed")) throw new WorkflowError("Resolve the existing cleaning task before checkout.");
      room.occupancy = "vacant"; room.housekeeping = "dirty"; roomChanged(room);
      next.tasks.unshift({ id: id(), roomId: room.id, status: "open", priority: "high", dueAt: undefined, createdAt: now(), checklist: createChecklist(), notes: "Post-checkout cleaning." });
      record("checkout", `Room ${room.number} checked out; cleaning request created`, room.id);
      break;
    }
    case "checkin": {
      requireRole("front_desk");
      const room = roomById(command.roomId); checkVersion(room, command.expectedVersion);
      if (!isAssignable(room)) throw new WorkflowError("Room must be vacant, inspected clean, and maintenance clear to check in.");
      room.occupancy = "occupied"; roomChanged(room);
      record("checkin", `Room ${room.number} assigned for check-in`, room.id);
      break;
    }
    case "assign": {
      requireRole("manager");
      const task = taskById(command.taskId);
      if (!["open", "assigned", "needs_rework"].includes(task.status)) throw new WorkflowError("Only pending tasks may be assigned.");
      const cleaner = next.staff.find(person => person.id === command.staffId);
      if (!cleaner || cleaner.role !== "housekeeper") throw new WorkflowError("Select a housekeeping staff member.");
      task.assigneeId = cleaner.id; task.status = "assigned";
      record("assign", `Assigned room ${roomById(task.roomId).number} to ${cleaner.name}`, task.roomId);
      break;
    }
    case "start": {
      const task = taskById(command.taskId); assignedCleaner(task);
      const room = roomById(task.roomId); checkVersion(room, command.expectedVersion);
      if (task.status !== "assigned" || room.housekeeping !== "dirty" || room.maintenance === "out_of_order") throw new WorkflowError("This task cannot be started in its current state.");
      task.status = "in_progress"; task.startedAt = now(); room.housekeeping = "in_progress"; roomChanged(room);
      record("start_cleaning", `${actor.name} started cleaning room ${room.number}`, room.id);
      break;
    }
    case "checklist": {
      const task = taskById(command.taskId); assignedCleaner(task);
      if (task.status !== "in_progress") throw new WorkflowError("Start cleaning before updating the checklist.");
      const item = task.checklist.find(entry => entry.id === command.itemId);
      if (!item) throw new WorkflowError("Checklist item not found.");
      item.checked = !item.checked;
      break;
    }
    case "submit": {
      const task = taskById(command.taskId); assignedCleaner(task);
      const room = roomById(task.roomId); checkVersion(room, command.expectedVersion);
      if (task.status !== "in_progress" || room.housekeeping !== "in_progress") throw new WorkflowError("Cleaning is not in progress.");
      if (!task.checklist.every(item => item.checked)) throw new WorkflowError("Complete every checklist item before submitting.");
      task.status = "pending_inspection"; task.completedAt = now(); room.housekeeping = "pending_inspection"; roomChanged(room);
      record("submit_inspection", `Room ${room.number} submitted for supervisor inspection`, room.id);
      break;
    }
    case "inspect": {
      requireRole("supervisor");
      const task = taskById(command.taskId);
      const room = roomById(task.roomId); checkVersion(room, command.expectedVersion);
      if (task.status !== "pending_inspection" || room.housekeeping !== "pending_inspection") throw new WorkflowError("Room is not pending inspection.");
      if (!command.approved && !command.reason?.trim()) throw new WorkflowError("A rejection reason is required.");
      if (command.approved) {
        task.status = "completed"; room.housekeeping = "clean";
        record("inspection_approved", `Room ${room.number} inspection approved by ${actor.name}`, room.id);
      } else {
        task.status = "needs_rework"; task.notes = command.reason!.trim(); task.checklist = createChecklist(); room.housekeeping = "dirty";
        record("inspection_rejected", `Room ${room.number} needs rework: ${command.reason!.trim()}`, room.id);
      }
      roomChanged(room);
      break;
    }
    case "maintenance": {
      requireRole("manager");
      const room = roomById(command.roomId); checkVersion(room, command.expectedVersion);
      const target = command.outOfOrder ? "out_of_order" : "clear";
      if (room.maintenance === target) throw new WorkflowError("Maintenance status is already set.");
      room.maintenance = target; roomChanged(room);
      record("maintenance", `Room ${room.number} maintenance ${command.outOfOrder ? "hold added" : "hold cleared"}`, room.id);
      break;
    }
    case "consume": {
      const task = taskById(command.taskId); assignedCleaner(task);
      if (!["in_progress", "pending_inspection"].includes(task.status)) throw new WorkflowError("Supplies can be recorded only during room cleaning.");
      const item = next.inventory.find(entry => entry.id === command.itemId);
      if (!item) throw new WorkflowError("Inventory item not found.", "NOT_FOUND");
      if (!Number.isSafeInteger(command.quantity) || command.quantity <= 0 || command.quantity > 100) throw new WorkflowError("Enter a valid positive supply quantity.");
      if (next.stockMovements.some(move => move.taskId === task.id && move.itemId === item.id)) throw new WorkflowError("This supply was already recorded for the task; duplicate deduction prevented.");
      if (item.onHand < command.quantity) throw new WorkflowError("Not enough stock is available.");
      item.onHand -= command.quantity;
      next.stockMovements.unshift({ id: id(), itemId: item.id, taskId: task.id, quantity: command.quantity, actorId, createdAt: now() });
      record("stock_used", `${command.quantity} ${item.unit} of ${item.name} recorded for room ${roomById(task.roomId).number}`, task.roomId);
      break;
    }
    case "purchase": {
      requireRole("purchasing");
      const item = next.inventory.find(entry => entry.id === command.itemId);
      if (!item) throw new WorkflowError("Inventory item not found.", "NOT_FOUND");
      if (!Number.isSafeInteger(command.quantity) || command.quantity <= 0 || command.quantity > 10000) throw new WorkflowError("Enter a valid purchase quantity.");
      if (next.purchaseRequests.some(request => request.itemId === item.id && request.status === "pending")) throw new WorkflowError("An approval request is already pending for this item.");
      next.purchaseRequests.unshift({ id: id(), itemId: item.id, quantity: command.quantity, requestedBy: actorId, status: "pending", note: command.note.trim() || `Replenish ${item.name}`, createdAt: now() });
      record("purchase_requested", `${actor.name} requested ${command.quantity} ${item.unit} of ${item.name}`);
      break;
    }
    case "decidePurchase": {
      requireRole("purchasing");
      const request = next.purchaseRequests.find(item => item.id === command.requestId);
      if (!request) throw new WorkflowError("Purchase request not found.", "NOT_FOUND");
      if (request.status !== "pending") throw new WorkflowError("Request has already been decided.");
      request.status = command.approved ? "approved" : "rejected"; request.decidedBy = actorId; request.decidedAt = now();
      record("purchase_decided", `Internal purchase request ${command.approved ? "approved" : "rejected"} by ${actor.name}`);
      break;
    }
    default: { const _exhaustive: never = command; return _exhaustive; }
  }

  next.version += 1;
  return next;
}

export function roleTitle(staff: StaffMember): string {
  return { manager: "Operations manager", front_desk: "Front desk", housekeeper: "Housekeeping", supervisor: "Floor supervisor", purchasing: "Purchasing" }[staff.role];
}
