import Link from "next/link";
import { FileQuestion, Home, PhoneCall, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      {/* 404 Illustration / Badge */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-inner border border-brand/20">
        <FileQuestion className="h-10 w-10 text-brand" />
        <span className="absolute -bottom-2 -right-2 inline-flex items-center rounded-full bg-gold px-2 py-0.5 text-xs font-black text-ink shadow-xs">
          404
        </span>
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-gold">
        Error 404 · Obafemi Awolowo University
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-text-secondary sm:text-base leading-relaxed">
        The safety report, resource, or destination you are looking for doesn&apos;t exist, has been relocated, or is temporarily unavailable.
      </p>

      {/* Helpful Action Links */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/">
          <Button size="lg" className="w-full bg-brand text-white hover:bg-brand-hover shadow-sm sm:w-auto">
            <Home className="mr-2 h-4 w-4" /> Return Home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="w-full border-border bg-white text-ink hover:bg-surface-muted shadow-xs sm:w-auto">
            <Shield className="mr-2 h-4 w-4 text-gold" /> Student Dashboard
          </Button>
        </Link>
        <Link href="/emergency">
          <Button size="lg" variant="ghost" className="w-full text-danger hover:bg-red-50 hover:text-red-800 sm:w-auto font-semibold">
            <PhoneCall className="mr-2 h-4 w-4" /> Campus Emergency
          </Button>
        </Link>
      </div>

      <div className="mt-12 rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 max-w-lg">
        <p className="font-semibold">Need to track an existing report?</p>
        <p className="mt-0.5 text-amber-800">
          Sign in to your account to review your active reports, or double-check the 8-character reference code from your confirmation screen.
        </p>
      </div>
    </div>
  );
}
