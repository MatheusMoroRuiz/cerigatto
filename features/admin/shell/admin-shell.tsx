"use client";

import {
  ClipboardList,
  ExternalLink,
  FileText,
  FolderTree,
  History,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  LogOut,
  Menu,
  Newspaper,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Search,
  SearchCheck,
  Settings,
  Sofa,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import type { AppRole } from "@/types/catalog";
import { cn } from "@/lib/cn";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/features/admin/auth/actions";
import { ADMIN_NAV } from "./nav";

const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  package: Package,
  "folder-tree": FolderTree,
  tag: Tag,
  "list-checks": ListChecks,
  percent: Percent,
  image: ImageIcon,
  "layout-grid": LayoutGrid,
  sofa: Sofa,
  newspaper: Newspaper,
  "file-text": FileText,
  inbox: Inbox,
  "clipboard-list": ClipboardList,
  "search-check": SearchCheck,
  settings: Settings,
  users: Users,
  history: History,
};

const RANK: Record<AppRole, number> = { editor: 1, admin: 2, super_admin: 3 };
const COLLAPSE_KEY = "cerigatto:admin:sidebar-collapsed";

function subscribeCollapse(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("cerigatto:sidebar", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("cerigatto:sidebar", listener);
  };
}

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

function NavLinks({ role, collapsed, onNavigate }: { role: AppRole; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel" className="flex flex-col gap-5 px-3 py-4">
      {ADMIN_NAV.map((group) => {
        const items = group.items.filter((item) => RANK[role] >= RANK[item.minRole]);
        if (items.length === 0) return null;
        return (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-1.5 px-3 font-mono text-[0.62rem] tracking-[0.16em] text-secondary-foreground/45 uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {items.map((item) => {
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-secondary-foreground/12 text-white"
                          : "text-secondary-foreground/75 hover:bg-secondary-foreground/8 hover:text-white",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <Icon className={cn("size-[18px] shrink-0", active && "text-accent")} aria-hidden="true" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  role,
  roleLabel,
  userLabel,
  children,
}: {
  role: AppRole;
  roleLabel: string;
  userLabel: string;
  children: ReactNode;
}) {
  const collapsed = useSyncExternalStore(subscribeCollapse, readCollapsed, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => {
    try {
      window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "0" : "1");
    } catch {
      // ignora
    }
    window.dispatchEvent(new Event("cerigatto:sidebar"));
  };

  return (
    <div className="flex min-h-dvh">
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col bg-secondary text-secondary-foreground transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-secondary-foreground/10", collapsed ? "justify-center" : "justify-between px-5")}>
          {!collapsed ? (
            <Link href="/admin" className="font-display text-lg font-extrabold" style={{ fontStretch: "125%" }}>
              CERIGATTO
            </Link>
          ) : null}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="inline-flex size-9 items-center justify-center rounded-md text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-white"
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks role={role} collapsed={collapsed} />
        </div>
        <div className="tape-thin" aria-hidden="true" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-surface/95 px-4 backdrop-blur sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex size-10 items-center justify-center rounded-md hover:bg-muted lg:hidden" aria-label="Abrir menu do painel">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" title="Painel Cerigatto" className="bg-secondary text-secondary-foreground [&_h2]:text-white">
              <NavLinks role={role} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <form action="/admin/busca" role="search" className="relative max-w-md flex-1">
            <label htmlFor="admin-search" className="sr-only">
              Buscar no painel
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="admin-search"
              name="q"
              type="search"
              placeholder="Buscar produto, SKU, categoria ou marca"
              className="h-10 w-full rounded-md border border-border-strong bg-background pr-3 pl-9 text-sm"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium hover:bg-muted sm:inline-flex"
            >
              Ver site <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
            <div className="hidden text-right leading-tight md:block">
              <p className="max-w-48 truncate text-sm font-semibold">{userLabel}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Sair do painel"
                title="Sair"
              >
                <LogOut className="size-5" />
              </button>
            </form>
          </div>
        </header>
        <main id="conteudo" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
