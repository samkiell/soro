"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview", match: (path: string) => path === "/admin" },
  {
    href: "/admin/reports",
    label: "Reports",
    match: (path: string) => path.startsWith("/admin/reports"),
  },
];

/** Presentational nav. `pathname` is null while the current route is unknown. */
export function AdminNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Admin" className="flex gap-1 rounded-lg border border-border bg-white p-1">
      {LINKS.map((link) => {
        const active = pathname !== null && link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium transition-colors",
              active ? "bg-brand text-white" : "text-text-secondary hover:bg-surface-muted hover:text-brand",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Highlights the active link. Render inside <Suspense> (usePathname on dynamic routes). */
export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}
