import { describe, expect, it } from "vitest";
import { seedState } from "@/lib/seed";
import { applyCommand, WorkflowError } from "@/lib/workflow";
import { isAssignable, statusForRoom } from "@/lib/room-status";

const getRoom = (state: ReturnType<typeof seedState>, number: string) => state.rooms.find(room => room.number === number)!;

describe("Room readiness state machine", () => {
  it("requires vacant, inspected clean and no maintenance hold", () => {
    const state = seedState();
    expect(isAssignable(getRoom(state, "201"))).toBe(true);
    expect(isAssignable(getRoom(state, "203"))).toBe(false);
    expect(statusForRoom(getRoom(state, "208"))).toBe("blocked");
    expect(isAssignable(getRoom(state, "208"))).toBe(false);
  });

  it("blocks unauthorized check-in", () => {
    const state = seedState();
    expect(() => applyCommand(state, { type: "checkin", roomId: "room-201", expectedVersion: 1 }, "staff-priya")).toThrow(WorkflowError);
    expect(() => applyCommand(state, { type: "checkin", roomId: "room-202", expectedVersion: 1 }, "staff-rohan")).toThrow(/vacant, inspected clean/);
  });

  it("moves cleaning through assignment, checklist and independent supervisor approval", () => {
    let state = seedState();
    const taskId = "task-202";
    state = applyCommand(state, { type: "assign", taskId, staffId: "staff-priya" }, "staff-amara");
    state = applyCommand(state, { type: "start", taskId, expectedVersion: 1 }, "staff-priya");
    expect(getRoom(state, "202").housekeeping).toBe("in_progress");
    expect(() => applyCommand(state, { type: "submit", taskId, expectedVersion: 2 }, "staff-priya")).toThrow(/Complete every checklist/);
    for (const item of state.tasks.find(task => task.id === taskId)!.checklist) {
      state = applyCommand(state, { type: "checklist", taskId, itemId: item.id }, "staff-priya");
    }
    state = applyCommand(state, { type: "consume", taskId, itemId: "item-amenity", quantity: 2 }, "staff-priya");
    expect(state.inventory.find(item => item.id === "item-amenity")!.onHand).toBe(15);
    expect(() => applyCommand(state, { type: "consume", taskId, itemId: "item-amenity", quantity: 2 }, "staff-priya")).toThrow(/already recorded/);
    state = applyCommand(state, { type: "submit", taskId, expectedVersion: 2 }, "staff-priya");
    expect(getRoom(state, "202").housekeeping).toBe("pending_inspection");
    expect(() => applyCommand(state, { type: "inspect", taskId, approved: true, expectedVersion: 3 }, "staff-priya")).toThrow(/supervisor/);
    state = applyCommand(state, { type: "inspect", taskId, approved: true, expectedVersion: 3 }, "staff-neha");
    expect(getRoom(state, "202").housekeeping).toBe("clean");
    expect(isAssignable(getRoom(state, "202"))).toBe(true);
  });

  it("rejects an inspection with a required reason and supports rework", () => {
    const state = seedState();
    const task = state.tasks.find(entry => entry.status === "pending_inspection")!;
    const room = state.rooms.find(entry => entry.id === task.roomId)!;
    expect(() => applyCommand(state, { type: "inspect", taskId: task.id, approved: false, expectedVersion: room.version }, "staff-neha")).toThrow(/reason is required/);
    const next = applyCommand(state, { type: "inspect", taskId: task.id, approved: false, reason: "Mirror needs attention", expectedVersion: room.version }, "staff-neha");
    expect(next.rooms.find(entry => entry.id === room.id)!.housekeeping).toBe("dirty");
    expect(next.tasks.find(entry => entry.id === task.id)!.status).toBe("needs_rework");
  });

  it("blocks stale room updates rather than overwriting recent changes", () => {
    const state = seedState();
    const next = applyCommand(state, { type: "maintenance", roomId: "room-201", outOfOrder: true, expectedVersion: 1 }, "staff-amara");
    expect(() => applyCommand(next, { type: "maintenance", roomId: "room-201", outOfOrder: false, expectedVersion: 1 }, "staff-amara")).toThrow(/changed in another view/);
    expect(statusForRoom(getRoom(next, "201"))).toBe("blocked");
  });

  it("prevents an inventory request from being approved by the wrong role", () => {
    const state = seedState();
    const next = applyCommand(state, { type: "purchase", itemId: "item-amenity", quantity: 64, note: "Restock" }, "staff-kabir");
    const request = next.purchaseRequests[0];
    expect(() => applyCommand(next, { type: "decidePurchase", requestId: request.id, approved: true }, "staff-priya")).toThrow(/purchasing/);
    const approved = applyCommand(next, { type: "decidePurchase", requestId: request.id, approved: true }, "staff-kabir");
    expect(approved.purchaseRequests[0].status).toBe("approved");
  });
});
