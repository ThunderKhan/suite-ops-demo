"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, CircleHelp, ClipboardCheck, LayoutDashboard, Menu, Package2, RotateCcw, ShieldCheck, X } from "lucide-react";
import { useDemo } from "@/lib/demo-context";
import { Avatar } from "@/components/shared";
import { roleTitle } from "@/lib/workflow";

const navigation = [
  { href: "/overview", text: "Overview", icon: LayoutDashboard },
  { href: "/my-tasks", text: "Housekeeping", icon: ClipboardCheck },
  { href: "/inspections", text: "Inspections", icon: ShieldCheck },
  { href: "/inventory", text: "Inventory & purchasing", icon: Package2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, actorId, setActorId, reset, notice, clearNotice } = useDemo();
  const actor = state.staff.find(person => person.id === actorId) ?? state.staff[0];
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [roleMenu, setRoleMenu] = useState(false);
  const pendingInspections = state.tasks.filter(task => task.status === "pending_inspection").length;

  useEffect(() => { if (!notice) return; const timeout = setTimeout(clearNotice, 5000); return () => clearTimeout(timeout); }, [notice, clearNotice]);

  return <div className="app-layout">
    <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`} aria-label="Main navigation">
      <div className="sidebar__top">
        <Link href="/overview" className="brandmark" aria-label="Suite Operations home"><span className="brandmark__symbol">S<span>.</span></span><span className="brandmark__words"><strong>SUITE</strong><small>OPERATIONS STUDIO</small></span></Link>
        <button type="button" className="icon-button sidebar__close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={19}/></button>
      </div>
      <div className="property-switch"><span className="property-switch__badge">T</span><span><strong>Taj Santacruz</strong><small>Mumbai · Concept property</small></span><ChevronDown size={15}/></div>
      <div className="sidebar__section-label">WORKSPACE</div>
      <nav className="sidebar__nav">{navigation.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`sidebar__link ${pathname === item.href ? "sidebar__link--active" : ""}`}><Icon size={18} strokeWidth={1.6}/><span>{item.text}</span>{item.href === "/inspections" && pendingInspections > 0 ? <em>{pendingInspections}</em> : null}</Link>; })}</nav>
      <div className="sidebar__bottom"><div className="sidebar__quote"><span>“</span><p>Every room accounted for. Every handoff effortless.</p><i/></div><div className="sidebar__disclaimer">VSPH EXPLORATORY CONCEPT<br/>Illustrative data · No Taj endorsement</div></div>
    </aside>
    {menuOpen ? <button type="button" className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /> : null}

    <div className="app-content">
      <header className="topbar"><div className="topbar__left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21}/></button><span className="topbar__crumb">OPERATIONS <span>/</span> {navigation.find(item => item.href === pathname)?.text.toUpperCase() ?? "OVERVIEW"}</span></div><div className="topbar__right"><span className="demo-indicator"><span/> LIVE BROWSER DEMO</span><button type="button" className="icon-button topbar__help" aria-label="Help: This is a fictional client demo" title="Fictional browser-only demo, not integrated with hotel systems"><CircleHelp size={18}/></button><span className="topbar__divider"/><div className="account-container"><button className="account-button" type="button" onClick={() => setRoleMenu(open => !open)} aria-expanded={roleMenu} aria-haspopup="true"><Avatar person={actor} size="small"/><span><strong>{actor.name}</strong><small>{roleTitle(actor)}</small></span><ChevronDown size={14}/></button>{roleMenu ? <div className="role-menu"><span className="role-menu__heading">SIMULATE A STAFF ROLE</span>{state.staff.map(person => <button key={person.id} type="button" className={person.id === actorId ? "role-menu__selected" : ""} onClick={() => { setActorId(person.id); setRoleMenu(false); }}><Avatar person={person} size="small"/><span><strong>{person.name}</strong><small>{roleTitle(person)}</small></span>{person.id === actorId ? <span className="role-menu__check">✓</span> : null}</button>)}<div className="role-menu__foot">Role switching simulates permissions. It is not authentication.</div></div> : null}</div></div></header>
      <main className="workspace">{children}</main>
      <footer className="app-footer"><span>Suite Operations · Independent VSPH demo</span><span>Fictional data · Browser-local state · Not connected to a hotel PMS</span><button type="button" onClick={() => setResetConfirm(true)}><RotateCcw size={13}/> Reset demo</button></footer>
    </div>

    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{navigation.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={pathname === item.href ? "mobile-bottom-nav__active" : ""}><Icon size={20} strokeWidth={1.6}/><span>{item.href === "/my-tasks" ? "Tasks" : item.href === "/inventory" ? "Stock" : item.text}</span></Link>; })}</nav>
    {notice ? <div className="toast" role="status"><Bell size={16}/>{notice}<button type="button" onClick={clearNotice} aria-label="Dismiss"><X size={15}/></button></div> : null}
    {resetConfirm ? <div className="dialog-backdrop" role="presentation" onClick={() => setResetConfirm(false)}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title" onClick={event => event.stopPropagation()}><span className="eyebrow">DEMO CONTROLS</span><h2 id="reset-title">Start fresh?</h2><p>This restores the fictional room, housekeeping, stock and purchase request records to their original state. Your browser demo changes will be lost.</p><div className="dialog__actions"><button className="button button--secondary" type="button" onClick={() => setResetConfirm(false)}>Cancel</button><button className="button button--dark" type="button" onClick={() => { reset(); setResetConfirm(false); }}>Reset workspace <RotateCcw size={15}/></button></div></div></div> : null}
  </div>;
}
