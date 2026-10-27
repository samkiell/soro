import Link from "next/link";
import Image from "next/image";
import { Phone, Shield, Headphones, Users } from "lucide-react";
import { FIRE_SERVICE } from "@/features/emergency/contacts";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white text-sm text-text-secondary">
      {/* Brand values banner matching Reference Image 2 */}
      <div className="border-b border-purple-900 bg-brand py-4 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gold" />
              <span>Report it.</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-gold" />
              <span>We respond.</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold" />
              <span>Together, we keep OAU safe</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gold/90 font-semibold tracking-wide">
            <Image
              src="/logo.png"
              alt="OAU Crest"
              width={22}
              height={22}
              className="object-contain"
            />
            <span>OBAFEMI AWOLOWO UNIVERSITY</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Safety Callout */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950">
          <p className="font-bold text-amber-900">Emergency Protocol Notice</p>
          <p className="mt-1">
            Soro is an incident logging and management platform. Submitting a report does <strong>not</strong> automatically dispatch responders. For active fire or structural rescue emergencies, call the <strong>{FIRE_SERVICE.name}</strong> directly (Fire & Rescue only):{" "}
            <a href={FIRE_SERVICE.href} className="inline-flex items-center gap-1 font-bold text-danger underline hover:text-red-800">
              <Phone className="h-3 w-3" aria-hidden="true" /> {FIRE_SERVICE.display}
            </a>{" "}
            or see all{" "}
            <Link href="/emergency" className="font-semibold underline hover:text-amber-800">
              emergency contacts
            </Link>{" "}
            for health and security services.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-text-muted sm:flex-row">
          <p>© 2026 Soro · Obafemi Awolowo University Campus Safety System</p>
          <div className="flex gap-5 font-medium">
            <Link href="/emergency" className="hover:text-brand transition-colors">
              Emergency
            </Link>
            <Link href="/login" className="hover:text-brand transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-brand transition-colors">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

