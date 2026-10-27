import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  PhoneCall,
  Lock,
  Bell,
  ArrowRight,
  EyeOff,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-warm-cream py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Content Column */}
            <div className="flex flex-col items-start lg:col-span-7">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/80 px-3.5 py-1 text-xs font-semibold text-ink shadow-2xs">
                <Shield className="h-3.5 w-3.5 text-gold fill-gold/30" />
                <span>Your safety. Our priority.</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-brand sm:text-5xl lg:text-6xl">
                Report it.
                <span className="block text-gold">We&apos;ll handle it.</span>
              </h1>

              {/* Subtext */}
              <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg leading-relaxed">
                Soro makes it easy to report incidents on campus and get the help you need — fast.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:items-center">
                <Link href="/report/new" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-brand text-white hover:bg-brand-hover shadow-sm sm:w-auto"
                  >
                    Report an Incident
                  </Button>
                </Link>
                <Link href="/emergency" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-border bg-white text-ink hover:bg-surface-muted shadow-xs sm:w-auto"
                  >
                    View Emergency Contacts
                  </Button>
                </Link>
              </div>

              {/* Privacy Indicator */}
              <div className="mt-6 flex items-center gap-2 text-xs text-text-secondary">
                <Lock className="h-3.5 w-3.5 text-gold" />
                <span>End-to-end privacy. Anonymous reporting option supported.</span>
              </div>
            </div>

            {/* Right Visual Column: OAU Senate Building & Landmark Hero Image */}
            <div className="flex justify-center lg:col-span-5">
              <div className="relative w-full max-w-md">
                {/* Decorative background aura */}
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-gold/20 to-brand/15 blur-xl"></div>

                <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-white/80 p-3 shadow-md backdrop-blur-xs">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-warm-cream shadow-inner">
                    <Image
                      src="/download (7).jpeg"
                      alt="Obafemi Awolowo University Campus Senate Building"
                      fill
                      priority
                      className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between px-1.5 pb-0.5">
                    <span className="text-xs font-bold tracking-wider text-brand uppercase">
                      Great Ife · OAU Campus
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-gold border border-amber-200/70">
                      Iconic Landmark
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Feature Strip (Direct Reproduction from Reference Image 1) */}
      <section className="bg-brand py-6 text-white shadow-inner">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Easy Reporting */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold shadow-xs">
                <Shield className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Easy Reporting</h3>
                <p className="text-xs text-purple-200">Submit incidents in a few simple steps</p>
              </div>
            </div>

            {/* 2. Anonymous Option */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold shadow-xs">
                <Lock className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Anonymous Option</h3>
                <p className="text-xs text-purple-200">Report anonymously with complete privacy</p>
              </div>
            </div>

            {/* 3. Track Status */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold shadow-xs">
                <Bell className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Track Status</h3>
                <p className="text-xs text-purple-200">Get real-time updates on your report</p>
              </div>
            </div>

            {/* 4. One-Tap Help */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold shadow-xs">
                <PhoneCall className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">One-Tap Help</h3>
                <p className="text-xs text-purple-200">Quick access to emergency contacts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Soro Section */}
      <section id="about" className="bg-white py-16 sm:py-20 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gold">About Soro</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">
              Campus Safety Built for Students & Responders
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
              Soro bridge students and campus security at Obafemi Awolowo University. Designed for speed, accountability, and student confidentiality.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border bg-warm-cream/30 hover:border-gold/50 transition-colors">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-gold">
                  <Shield className="h-5 w-5 text-gold" />
                </div>
                <CardTitle className="mt-3 text-lg font-bold text-brand">Secure & Accountable</CardTitle>
                <CardDescription className="text-sm text-text-secondary">
                  Every submitted report is logged with an immutable audit trail, ensuring security officers and administrators investigate transparently.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-warm-cream/30 hover:border-gold/50 transition-colors">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-gold">
                  <EyeOff className="h-5 w-5 text-gold" />
                </div>
                <CardTitle className="mt-3 text-lg font-bold text-brand">Confidential Reporting</CardTitle>
                <CardDescription className="text-sm text-text-secondary">
                  Students may report sensitive concerns anonymously. Your personal information will never be shared without consent.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-warm-cream/30 hover:border-gold/50 transition-colors">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-gold">
                  <Clock className="h-5 w-5 text-gold" />
                </div>
                <CardTitle className="mt-3 text-lg font-bold text-brand">Transparent Progress</CardTitle>
                <CardDescription className="text-sm text-text-secondary">
                  Monitor the investigation lifecycle from &quot;Received&quot; to &quot;In Progress&quot; and &quot;Resolved&quot; in real-time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How Soro Works Section */}
      <section id="how-it-works" className="bg-warm-cream/40 py-16 sm:py-20 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gold">Simple 3-Step Process</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">
              How Soro Works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
              Submit your concern in seconds, let the security team review, and follow updates until resolution.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center rounded-xl border border-amber-200/70 bg-white p-6 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-gold font-extrabold text-lg shadow-xs">
                1
              </div>
              <h3 className="mt-4 font-bold text-brand text-base">Submit Your Report</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Describe the incident, choose campus location, specify urgency, and attach optional photo evidence.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center rounded-xl border border-amber-200/70 bg-white p-6 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-gold font-extrabold text-lg shadow-xs">
                2
              </div>
              <h3 className="mt-4 font-bold text-brand text-base">Security Review</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Authorized campus security personnel evaluate the report and initiate necessary response actions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center rounded-xl border border-amber-200/70 bg-white p-6 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-gold font-extrabold text-lg shadow-xs">
                3
              </div>
              <h3 className="mt-4 font-bold text-brand text-base">Follow Progress</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Receive timeline updates directly on your dashboard as official notes and resolution progress are posted.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/report/new">
              <Button size="lg" className="bg-brand text-white hover:bg-brand-hover font-semibold px-8 shadow-sm">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4 text-gold" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Urgent Emergency Callout Section */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 rounded-xl border-2 border-danger/40 bg-red-50/70 p-6 sm:flex-row sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger text-white shadow-xs">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-danger">Experiencing an active campus emergency?</h3>
                <p className="mt-1 text-sm text-text-secondary max-w-xl">
                  Do not wait for a ticket review. Submitting an online report does not automatically dispatch immediate rescue teams. Call campus responders directly.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <a
                href="tel:08162214241"
                className="flex items-center justify-center gap-2 rounded-md bg-danger px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-800"
              >
                <PhoneCall className="h-4 w-4" /> Call 08162214241
              </a>
              <Link
                href="/emergency"
                className="text-center text-xs font-semibold text-brand underline hover:text-brand-hover"
              >
                View full emergency directory
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
