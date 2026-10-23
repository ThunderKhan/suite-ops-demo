"use client";

import type { ReactNode } from "react";
import { AlertCircle, Check, Clock3, DoorClosed, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import { statusMeta, statusForRoom, type DisplayStatus } from "@/lib/room-status";
import type { HotelRoom, Priority, StaffMember } from "@/lib/types";

const statusIcons = { ready: Check, occupied: DoorClosed, dirty: AlertCircle, cleaning: Sparkles, inspection: Clock3, blocked: Wrench };

export function StatusPill({ status, compact = false }: { status: DisplayStatus; compact?: boolean }) {
  const Icon = statusIcons[status];
  return <span className={`status-pill status-pill--${status} ${compact ? "status-pill--compact" : ""}`}><Icon size={13} strokeWidth={1.8} />{compact ? statusMeta[status].short : statusMeta[status].label}</span>;
}

export function StateText({ room }: { room: HotelRoom }) { return <StatusPill status={statusForRoom(room)} />; }

export function Avatar({ person, size = "normal" }: { person?: StaffMember; size?: "normal" | "small" }) {
  if (!person) return <span className={`avatar avatar--empty avatar--${size}`}>?</span>;
  return <span className={`avatar avatar--${size}`} style={{ backgroundColor: person.color }} title={person.name}>{person.initials}</span>;
}

export function Eyebrow({ children }: { children: ReactNode }) { return <span className="eyebrow">{children}</span>; }

export function SectionHeading({ eyebrow, title, aside }: { eyebrow?: string; title: string; aside?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}<h2>{title}</h2></div>{aside ? <div>{aside}</div> : null}</div>;
}

export function PriorityPill({ priority }: { priority: Priority }) {
  return <span className={`priority priority--${priority}`}>{priority === "urgent" ? <ShieldAlert size={12} /> : null}{priority}</span>;
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description: string }) {
  return <div className="empty-state">{icon ? <span className="empty-state__icon">{icon}</span> : null}<h3>{title}</h3><p>{description}</p></div>;
}

export function formatClock(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(iso));
}

export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(iso));
}

export function money(amount: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount); }
