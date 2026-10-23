import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center gap-2.5">
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-white text-ink hover:bg-surface-muted font-medium"
            >
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="secondary"
              size="sm"
              className="bg-gold text-ink hover:bg-gold-hover font-semibold shadow-2xs"
            >
              Register
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

