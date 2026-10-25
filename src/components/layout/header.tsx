import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Obafemi Awolowo University Crest"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold tracking-tight text-brand text-xl">Soro</span>
            <span className="hidden text-xs font-medium text-text-secondary md:inline-block">
              Campus Safety
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-brand transition-colors"
          >
            Home
          </Link>
          <a
            href="#about"
            className="text-sm font-medium text-text-secondary hover:text-brand transition-colors"
          >
            About
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-text-secondary hover:text-brand transition-colors"
          >
            How It Works
          </a>
          <Link
            href="/emergency"
            className="text-sm font-medium text-text-secondary hover:text-brand transition-colors"
          >
            Emergency
          </Link>
        </nav>

        {/* Right Action Buttons */}
        {/* Reads the session, so it streams in behind a boundary. */}
        <Suspense fallback={<div className="h-9 w-40" aria-hidden="true" />}>
          <HeaderActions />
        </Suspense>
      </div>
    </header>
  );
}

async function HeaderActions() {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    return (
      <div className="flex items-center gap-2.5">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-border bg-white text-ink hover:bg-surface-muted font-medium",
          )}
        >
          Login
        </Link>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "bg-gold text-ink hover:bg-gold-hover font-semibold shadow-2xs",
          )}
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      {user.role === "ADMIN" ? (
        <Link href="/admin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Admin
        </Link>
      ) : (
        <Link href="/report/new" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          New report
        </Link>
      )}
      <span className="hidden max-w-[10rem] truncate text-sm text-text-secondary md:inline">
        {user.name}
      </span>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}

