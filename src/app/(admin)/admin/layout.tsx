import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminNav, AdminNavLinks } from "@/features/admin/components/admin-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Navigation only. Every admin page and action checks the admin role on the server.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="border-t-4 border-gold bg-surface-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Admin workspace
          </p>
          <Suspense fallback={<AdminNavLinks pathname={null} />}>
            <AdminNav />
          </Suspense>
        </div>
        {children}
      </div>
    </div>
  );
}
