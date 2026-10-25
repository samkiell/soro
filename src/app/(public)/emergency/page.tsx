import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Phone } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FIRE_SERVICE } from "@/features/emergency/contacts";
import { CopyNumberButton } from "@/features/emergency/copy-number-button";

export const metadata: Metadata = {
  title: "Emergency contacts · Soro",
  description:
    "Emergency contact numbers for OAU students and what to say when you call.",
};

export default function EmergencyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">
          Emergency contacts
        </h1>
        <p className="text-base text-text-secondary">
          Get help first. You can report the incident on Soro once you are safe.
        </p>
      </header>

      <Alert variant="danger" title="In immediate danger? Call now.">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          <span>
            Don&apos;t wait to fill in an online report. Contact the emergency
            service directly.
          </span>
        </p>
      </Alert>

      <section
        aria-labelledby="fire-service-heading"
        className="rounded-lg border border-border bg-surface p-5 shadow-xs sm:p-6"
      >
        <h2
          id="fire-service-heading"
          className="text-sm font-semibold uppercase tracking-wide text-text-secondary"
        >
          {FIRE_SERVICE.name}
        </h2>
        <p className="mt-2 select-all text-3xl font-bold tabular-nums tracking-tight text-ink sm:text-4xl">
          {FIRE_SERVICE.display}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:items-start">
          <a
            href={FIRE_SERVICE.href}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            Call {FIRE_SERVICE.name}
          </a>
          <CopyNumberButton number={FIRE_SERVICE.number} />
        </div>

        <p className="mt-3 text-sm text-text-secondary">
          On a phone, the call button opens your dialer with the number filled in.
          You still need to press call. On a computer, dial {FIRE_SERVICE.display}{" "}
          from any phone.
        </p>
      </section>

      <section aria-labelledby="what-to-say-heading" className="flex flex-col gap-3">
        <h2 id="what-to-say-heading" className="text-xl font-semibold text-ink">
          When you call, tell them
        </h2>
        <ol className="flex list-decimal flex-col gap-2 pl-6 text-base text-text-primary marker:font-semibold marker:text-brand">
          <li>
            <strong>Your name</strong>, if you can share it.
          </li>
          <li>
            <strong>The exact location</strong>: building, hall, faculty, room, or
            the nearest landmark.
          </li>
          <li>
            <strong>What is happening</strong>, and what caused it if you know.
          </li>
        </ol>
        <p className="text-sm text-text-secondary">
          Stay on the line and answer their questions.
        </p>
      </section>

      <section
        aria-labelledby="soro-limits-heading"
        className="flex flex-col gap-3 rounded-lg border border-border bg-light-gold p-5"
      >
        <h2 id="soro-limits-heading" className="text-lg font-semibold text-ink">
          What Soro can and can&apos;t do
        </h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-text-primary">
          <li>The call button only opens your phone&apos;s dialer. It doesn&apos;t place the call for you.</li>
          <li>
            Soro doesn&apos;t alert campus security, share your location, or notify
            responders.
          </li>
          <li>Use a Soro report for non-emergencies, or to follow up once you are safe.</li>
        </ul>
        <Link
          href="/report/new"
          className="inline-flex min-h-[44px] items-center gap-1.5 self-start text-sm font-semibold text-brand underline-offset-4 hover:underline"
        >
          Report a non-emergency incident
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
