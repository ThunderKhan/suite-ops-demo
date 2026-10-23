"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { seedState } from "@/lib/seed";
import { applyCommand } from "@/lib/workflow";
import type { DemoCommand, DemoState } from "@/lib/types";

const STORAGE_KEY = "suite-ops-demo:state:v1";
const USER_KEY = "suite-ops-demo:actor:v1";
const CHANNEL = "suite-ops-demo:updates";

interface DemoContextValue {
  state: DemoState;
  actorId: string;
  setActorId: (id: string) => void;
  execute: (command: DemoCommand) => { ok: true } | { ok: false; error: string };
  reset: () => void;
  notice: string;
  clearNotice: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function isValidState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<DemoState>;
  return Array.isArray(state.rooms) && Array.isArray(state.tasks) && Array.isArray(state.staff) && Array.isArray(state.inventory) && Array.isArray(state.purchaseRequests) && Array.isArray(state.stockMovements) && Array.isArray(state.events) && typeof state.version === "number";
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(seedState);
  const [actorId, setActor] = useState("staff-amara");
  const [notice, setNotice] = useState("");
  const stateRef = useRef(state);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let active = true;
    // Read persisted browser state after hydration to keep server/client markup stable.
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (isValidState(parsed) && parsed.version >= stateRef.current.version) { stateRef.current = parsed; setState(parsed); }
        }
        const actor = window.localStorage.getItem(USER_KEY);
        if (actor && seedState().staff.some(person => person.id === actor)) setActor(actor);
      } catch { /* Storage unavailable: keep functional in-memory demo. */ }
    });

    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(CHANNEL);
      channelRef.current = channel;
      channel.onmessage = (event: MessageEvent<unknown>) => {
        if (!isValidState(event.data)) return;
        if (event.data.version > stateRef.current.version) { stateRef.current = event.data; setState(event.data); }
      };
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try { const parsed: unknown = JSON.parse(event.newValue); if (isValidState(parsed) && parsed.version > stateRef.current.version) { stateRef.current = parsed; setState(parsed); } } catch { /* Ignore malformed external values. */ }
    };
    window.addEventListener("storage", onStorage);
    return () => { active = false; channelRef.current?.close(); window.removeEventListener("storage", onStorage); };
  }, []);

  const persist = useCallback((next: DemoState) => {
    stateRef.current = next;
    setState(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Use memory-only state. */ }
    channelRef.current?.postMessage(next);
  }, []);

  const setActorId = useCallback((id: string) => {
    if (!stateRef.current.staff.some(person => person.id === id)) return;
    setActor(id);
    try { window.localStorage.setItem(USER_KEY, id); } catch { /* Optional persistence. */ }
    setNotice("");
  }, []);

  const execute = useCallback((command: DemoCommand) => {
    try {
      const next = applyCommand(stateRef.current, command, actorId);
      persist(next);
      setNotice("Change saved to the demo workspace.");
      return { ok: true as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setNotice(message);
      return { ok: false as const, error: message };
    }
  }, [actorId, persist]);

  const reset = useCallback(() => {
    const next = seedState();
    next.version = stateRef.current.version + 1;
    persist(next);
    setNotice("All fictional data restored to the opening scenario.");
  }, [persist]);

  return <DemoContext.Provider value={{ state, actorId, setActorId, execute, reset, notice, clearNotice: () => setNotice("") }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be called inside DemoProvider");
  return context;
}
