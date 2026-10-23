"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, Check, CircleAlert, Clock3, DoorClosed, Package2, Search, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { useDemo } from "@/lib/demo-context";
import { activeTaskForRoom, isAssignable, roomCounts, statusForRoom, statusMeta, type DisplayStatus } from "@/lib/room-status";
import { Avatar, Eyebrow, formatClock, formatShortDate, PriorityPill, SectionHeading, StatusPill } from "@/components/shared";
import type { HotelRoom } from "@/lib/types";

const statusIcons = { ready: Check, occupied: DoorClosed, dirty: CircleAlert, cleaning: Sparkles, inspection: Clock3, blocked: Wrench };
const statusOrder: DisplayStatus[] = ["ready", "occupied", "dirty", "cleaning", "inspection", "blocked"];
const statusFoot: Record<DisplayStatus, string> = { ready: "Available to assign", occupied: "Currently in use", dirty: "Attention needed", cleaning: "Team is on it", inspection: "Pending sign-off", blocked: "Unavailable" };

export function OverviewView() {
  const { state } = useDemo();
  const [floor, setFloor] = useState(2);
  const [filter, setFilter] = useState<DisplayStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("room-202");

  const floors = useMemo(() => [...new Set(state.rooms.map(room => room.floor))].sort((a,b) => a - b), [state.rooms]);
  const visibleRooms = useMemo(() => state.rooms.filter(room => room.floor === floor && (filter === "all" || statusForRoom(room) === filter) && room.number.includes(search.trim())).sort((a,b) => a.number.localeCompare(b.number)), [state.rooms, floor, filter, search]);
  const selectedRoom = visibleRooms.find(room => room.id === selectedId) ?? visibleRooms[0] ?? state.rooms.find(room => room.id === selectedId) ?? state.rooms[0];
  const counts = useMemo(() => roomCounts(state.rooms), [state.rooms]);
  const queue = useMemo(() => state.tasks.filter(task => !["completed", "pending_inspection"].includes(task.status)).sort((a,b) => {
    const weight = { urgent: 0, high: 1, normal: 2 };
    return weight[a.priority] - weight[b.priority] || (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
  }).slice(0, 5), [state.tasks]);
  const lowItems = state.inventory.filter(item => item.onHand <= item.reorderAt);

  return <>
    <div className="page-intro"><div className="page-intro__copy"><Eyebrow>THE DAILY PULSE · OPERATIONS CENTER</Eyebrow><h1>A clearer picture of <em>every room.</em></h1><p>One shared view for front desk, housekeeping, and operations—so the right room is ready at the right moment.</p></div><div className="page-intro__actions"><span className="demo-indicator"><span/> STATUS BOARD ACTIVE</span><Link href="/my-tasks" className="button button--dark">Open housekeeping <span className="button-icon"><ArrowUpRight size={14}/></span></Link></div></div>

    <div className="stats-grid">{statusOrder.map(status => { const Icon = statusIcons[status]; return <div className="stat-shell" key={status}><div className={`stat-card stat-card--${status}`}><div className="stat-card__label"><span>{statusMeta[status].label}</span><Icon size={17} strokeWidth={1.5}/></div><strong className="stat-card__value">{String(counts[status]).padStart(2, "0")}</strong><span className="stat-card__foot">{statusFoot[status]}</span></div></div>; })}</div>

    <div className="operation-grid"><div className="surface-shell"><section className="surface rack-panel" aria-label="Visual room rack"><div className="rack-panel__header"><div className="rack-panel__heading"><Eyebrow>ROOM READINESS · LIVE CONCEPT</Eyebrow><h2>The room rack</h2><p>Logical room grouping · not an architectural floor plan</p></div><div className="rack-tools"><label className="sr-only" htmlFor="room-search">Search room number</label><input id="room-search" className="field" placeholder="Room number" value={search} onChange={event => setSearch(event.target.value)}/><label className="sr-only" htmlFor="room-filter">Filter by status</label><select id="room-filter" className="select" value={filter} onChange={event => setFilter(event.target.value as DisplayStatus | "all")}><option value="all">All statuses</option>{statusOrder.map(status => <option key={status} value={status}>{statusMeta[status].label}</option>)}</select></div></div>
      <div className="floor-tabs" role="tablist" aria-label="Floors">{floors.map(value => <button key={value} type="button" role="tab" aria-selected={floor === value} onClick={() => { setFloor(value); setSelectedId(`room-${value}01`); }}>{`Floor ${String(value).padStart(2,"0")}`}</button>)}</div>
      {visibleRooms.length ? <div className="room-grid">{visibleRooms.map(room => <RoomTile key={room.id} room={room} selected={room.id === selectedRoom.id} onClick={() => setSelectedId(room.id)}/>)}</div> : <div className="empty-state"><span className="empty-state__icon"><Search size={24}/></span><h3>No matching rooms</h3><p>Try another room number or status filter.</p></div>}
      <div className="rack-legend" aria-label="Room status legend">{statusOrder.map(status => <span key={status}><i style={{ background: legendColors[status] }}/>{statusMeta[status].label}</span>)}</div>
    </section></div><div className="surface-shell"><RoomDetail key={selectedRoom.id} room={selectedRoom} /></div></div>

    <div className="below-grid"><div className="surface-shell"><section className="surface"><SectionHeading eyebrow="TODAY'S PRIORITIES" title="Housekeeping queue" aside={<Link href="/my-tasks" className="button button--outline button--sm">See all tasks <ArrowUpRight size={13}/></Link>}/><div className="task-list">{queue.map(task => { const room = state.rooms.find(item => item.id === task.roomId)!; const staff = state.staff.find(person => person.id === task.assigneeId); return <div className="queue-row" key={task.id}><span className="queue-row__number">{room.number}</span><div className="queue-row__description"><strong>{task.status === "in_progress" ? "Cleaning underway" : task.status === "needs_rework" ? "Rework requested" : task.status === "assigned" ? "Assigned for cleaning" : "Needs assignment"}</strong><small>{staff ? staff.name : "Unassigned"} · {room.category} room</small></div><PriorityPill priority={task.priority}/><Avatar person={staff} size="small"/><button type="button" className="queue-row__action" aria-label={`Inspect room ${room.number}`} onClick={() => { setFloor(room.floor); setSelectedId(room.id); window.scrollTo({ top: 190, behavior: "smooth" }); }}><ArrowRight size={15}/></button></div>; })}</div></section></div><div><div className="stock-signal"><Eyebrow>PURCHASING CONNECTION</Eyebrow><h3>From room turnover<br/>to smarter restocking.</h3><p>Room supplies can be recorded as they&apos;re used, creating early visibility into replenishment needs.</p><div className="stock-signal__row"><span>{lowItems.length} supply {lowItems.length === 1 ? "item" : "items"} below threshold</span><Link href="/inventory">View stock <ArrowUpRight size={15}/></Link></div></div><div className="surface-shell activity-feed"><div className="surface"><SectionHeading eyebrow="RECENT CHANGES" title="Activity log"/>{state.events.slice(0,4).map(event => <div className="activity-line" key={event.id}><span className="activity-line__icon"><Activity size={14}/></span><div><p>{event.description}</p><small>{formatShortDate(event.at)}</small></div></div>)}</div></div></div></div>
  </>;
}

const legendColors: Record<DisplayStatus, string> = { ready: "#23765B", occupied: "#4B709F", dirty: "#BB4E4B", cleaning: "#A66B19", inspection: "#765D9B", blocked: "#616565" };

function RoomTile({ room, selected, onClick }: { room: HotelRoom; selected: boolean; onClick: () => void }) {
  const status = statusForRoom(room);
  const Icon = statusIcons[status];
  return <button type="button" className={`room-tile room-tile--${status}`} aria-pressed={selected} aria-label={`Room ${room.number}, ${statusMeta[status].label}`} onClick={onClick}><div className="room-tile__top"><span className="room-tile__number">{room.number}</span><span className="room-tile__icon"><Icon size={14} strokeWidth={1.6}/></span></div><span className="room-tile__state"><i/>{statusMeta[status].short}</span><span className="room-tile__type">{room.category} room</span>{room.arrivalTime && room.occupancy === "vacant" ? <span className="room-tile__urgent" title="Priority arrival">ARRIVAL</span> : null}</button>;
}

function RoomDetail({ room }: { room: HotelRoom }) {
  const { state, actorId, execute } = useDemo();
  const [assignee, setAssignee] = useState("");
  const actor = state.staff.find(person => person.id === actorId)!;
  const task = activeTaskForRoom(state, room.id);
  const cleaner = state.staff.find(person => person.id === task?.assigneeId);
  const cleaners = state.staff.filter(person => person.role === "housekeeper");
  const status = statusForRoom(room);

  const apply = (command: Parameters<typeof execute>[0]) => execute(command);

  return <aside className="room-detail" aria-label={`Room ${room.number} details`}><div className="room-detail__head"><div className="room-detail__topline"><span>SELECTED ROOM</span><StatusPill status={status}/></div><h2 className="room-detail__number">{room.number}</h2><p className="room-detail__subtitle">{room.category} room · Floor {room.floor} · Concept layout</p></div><div className="room-detail__body"><div><span className="detail-label">ROOM CONDITION</span><div className="detail-rows"><div className="detail-row"><span>Occupancy</span><strong>{room.occupancy === "vacant" ? "Vacant" : "Occupied"}</strong></div><div className="detail-row"><span>Housekeeping</span><strong>{room.housekeeping === "clean" ? "Clean & inspected" : room.housekeeping === "dirty" ? "Needs cleaning" : room.housekeeping === "in_progress" ? "In progress" : "Awaiting inspection"}</strong></div><div className="detail-row"><span>Maintenance</span><strong>{room.maintenance === "clear" ? "No active hold" : "Out of order"}</strong></div><div className="detail-row"><span>Assigned to</span><strong>{cleaner?.name ?? "Not assigned"}</strong></div><div className="detail-row"><span>Last updated</span><strong>{formatClock(room.lastChanged)}</strong></div></div></div><div className="detail-divider"/><div><span className="detail-label">AVAILABLE ACTIONS</span><div className="detail-action-stack" style={{ marginTop: 14 }}>
    {actor.role === "manager" && task && ["open", "assigned", "needs_rework"].includes(task.status) ? <><label className="field-label" htmlFor="assign-cleaner">Assign housekeeper</label><select id="assign-cleaner" className="select" value={assignee || task.assigneeId || ""} onChange={event => setAssignee(event.target.value)}><option value="">Choose a team member</option>{cleaners.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select><button type="button" className="button button--dark button--wide" disabled={!assignee && !task.assigneeId} onClick={() => apply({ type: "assign", taskId: task.id, staffId: assignee || task.assigneeId! })}>Assign task <ArrowRight size={14}/></button></> : null}
    {actor.role === "front_desk" && room.occupancy === "occupied" ? <button type="button" className="button button--dark button--wide" onClick={() => apply({ type: "checkout", roomId: room.id, expectedVersion: room.version })}>Record checkout <ArrowRight size={14}/></button> : null}
    {actor.role === "front_desk" && isAssignable(room) ? <button type="button" className="button button--dark button--wide" onClick={() => apply({ type: "checkin", roomId: room.id, expectedVersion: room.version })}>Mark occupied <ArrowRight size={14}/></button> : null}
    {actor.role === "manager" ? <button type="button" className="button button--outline button--wide" onClick={() => apply({ type: "maintenance", roomId: room.id, outOfOrder: room.maintenance !== "out_of_order", expectedVersion: room.version })}><Wrench size={14}/>{room.maintenance === "clear" ? "Place maintenance hold" : "Clear maintenance hold"}</button> : null}
    {actor.role === "housekeeper" && task?.assigneeId === actor.id ? <Link href="/my-tasks" className="button button--dark button--wide">Open assigned task <ArrowRight size={14}/></Link> : null}
    {actor.role === "supervisor" && room.housekeeping === "pending_inspection" ? <Link href="/inspections" className="button button--dark button--wide">Review inspection <ShieldCheck size={14}/></Link> : null}
    {actor.role === "purchasing" ? <Link href="/inventory" className="button button--dark button--wide">Open supply controls <Package2 size={14}/></Link> : null}
    <p className="muted-hint">Actions depend on the selected simulated staff role. Try switching roles from the top-right profile menu.</p>
  </div></div></div></aside>;
}
