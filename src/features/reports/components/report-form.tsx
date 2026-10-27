"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Crosshair, Loader2, Map } from "lucide-react";
import { applyFieldErrors } from "@/components/forms/apply-field-errors";
import { FormField } from "@/components/forms/form-field";
import { LocationPickerModal } from "@/components/forms/location-picker-modal";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/features/reports/actions";
import { INCIDENT_TYPE_OPTIONS, STATUS_LABELS, URGENCY_OPTIONS } from "@/features/reports/labels";
import { formatDateTime, reportReference } from "@/lib/format";
import {
  LOCATION_MESSAGES,
  LocationError,
  requestDeviceLocation,
} from "@/lib/geolocation";
import {
  formatCampusFallbackLocation,
  isGenericLocation,
  type Place,
} from "@/lib/places";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, formatBytes } from "@/lib/storage/image";
import {
  REPORT_LIMITS,
  reportFieldsSchema,
  type ReportFields,
  type ReportFieldsInput,
} from "@/lib/validation/report";
import type { CreateReportResult, UploadPhotoError, UploadPhotoResult } from "@/types";
import { PhotoField, type PhotoState } from "./photo-field";

const QUICK_LANDMARKS = [
  "Senate Building",
  "Hezekiah Library",
  "Amphitheatre",
  "Spider Building",
  "Moremi Hall",
  "Awo Hall",
  "Fajuyi Hall",
  "Health Centre",
  "SUB",
] as const;

const REPORT_FIELDS = [
  "title",
  "description",
  "location",
  "incidentType",
  "urgency",
  "isAnonymous",
] as const;

const UPLOAD_ERROR_MESSAGES: Record<UploadPhotoError, string> = {
  UNAUTHENTICATED: "Your session has ended. Sign in again to attach a photo.",
  FORBIDDEN: "Your account can't upload photos.",
  INVALID_REQUEST: "That file couldn't be read. Try choosing it again.",
  FILE_TOO_LARGE: `This photo is larger than ${formatBytes(MAX_PHOTO_BYTES)}. Choose a smaller photo.`,
  UNSUPPORTED_FILE_TYPE: "This file isn't a JPEG, PNG, or WebP image.",
  STORAGE_UNAVAILABLE: "Photo uploads aren't available right now.",
  UPLOAD_FAILED: "The photo couldn't be uploaded.",
};

type SubmittedReport = Extract<CreateReportResult, { success: true }>["report"] & {
  isAnonymous: boolean;
};

type FormMessage = { text: string; signInLink?: boolean };

export function ReportForm() {
  const [photo, setPhotoState] = useState<PhotoState>({ status: "none" });
  const photoRef = useRef<PhotoState>(photo);
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle");
  const [formMessage, setFormMessage] = useState<FormMessage | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedReport | null>(null);
  const inFlight = useRef(false);
  const skipPhoto = useRef(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ReportFieldsInput, unknown, ReportFields>({
    resolver: zodResolver(reportFieldsSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      isAnonymous: false,
    },
  });
  const urgency = useWatch({ control, name: "urgency" });
  const currentLocationValue = useWatch({ control, name: "location" });

  async function handleDetectLocation() {
    setIsLocating(true);
    setLocationError(null);
    try {
      const coords = await requestDeviceLocation();
      const res = await fetch(`/api/places?lat=${coords.latitude}&lon=${coords.longitude}`);
      if (res.ok) {
        const data = (await res.json()) as { place?: Place | null };
        if (data.place?.label && !isGenericLocation(data.place.label)) {
          setValue("location", data.place.label, { shouldValidate: true });
          return;
        }
      }
      setValue(
        "location",
        formatCampusFallbackLocation(coords.latitude, coords.longitude),
        { shouldValidate: true },
      );
    } catch (err) {
      if (err instanceof LocationError) {
        setLocationError(LOCATION_MESSAGES[err.failure]);
      } else {
        setLocationError("Could not acquire your device location. Please enter it manually.");
      }
    } finally {
      setIsLocating(false);
    }
  }

  function setPhoto(next: PhotoState) {
    photoRef.current = next;
    setPhotoState(next);
  }

  function updateSelectedPhoto(changes: { photoKey?: string; error?: string }) {
    const current = photoRef.current;
    if (current.status === "selected") setPhoto({ ...current, ...changes });
  }

  function removePhoto() {
    const current = photoRef.current;
    if (current.status === "selected") URL.revokeObjectURL(current.previewUrl);
    setPhoto({ status: "none" });
  }

  // Release the preview URL when the form unmounts.
  useEffect(
    () => () => {
      const current = photoRef.current;
      if (current.status === "selected") URL.revokeObjectURL(current.previewUrl);
    },
    [],
  );

  useEffect(() => {
    if (formMessage) messageRef.current?.focus();
  }, [formMessage]);

  useEffect(() => {
    if (submitted) confirmationRef.current?.focus();
  }, [submitted]);

  function selectPhoto(file: File) {
    removePhoto();
    let error: string | undefined;
    // Early feedback only. The server checks the real file contents.
    if (file.size > MAX_PHOTO_BYTES) error = UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE;
    else if (!(file.type in PHOTO_TYPES)) error = UPLOAD_ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE;
    setPhoto({ status: "selected", file, previewUrl: URL.createObjectURL(file), error });
  }

  async function uploadSelectedPhoto(file: File): Promise<string | null> {
    setStage("uploading");
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/uploads", { method: "POST", body });
      const result = (await response.json().catch(() => null)) as UploadPhotoResult | null;
      if (result?.success) {
        updateSelectedPhoto({ photoKey: result.photoKey, error: undefined });
        return result.photoKey;
      }
      const reason = UPLOAD_ERROR_MESSAGES[result?.error ?? "UPLOAD_FAILED"];
      updateSelectedPhoto({
        error: `${reason} You can try again, or submit your report without a photo.`,
      });
    } catch {
      updateSelectedPhoto({
        error:
          "The photo couldn't be uploaded because of a connection problem. Try again, or submit without a photo.",
      });
    }
    return null;
  }

  async function onSubmit(values: ReportFields) {
    if (inFlight.current) return; // Guard against double submission.
    inFlight.current = true;
    setFormMessage(null);

    try {
      let photoKey: string | undefined;
      const current = photoRef.current;
      if (skipPhoto.current) {
        removePhoto();
      } else if (current.status === "selected") {
        if (current.photoKey) {
          photoKey = current.photoKey;
        } else {
          const uploaded = await uploadSelectedPhoto(current.file);
          if (!uploaded) return; // Keep everything; the student decides what to do next.
          photoKey = uploaded;
        }
      }

      setStage("saving");
      const result = await createReport({ ...values, photoKey });

      if (result.success) {
        removePhoto();
        reset();
        setSubmitted({ ...result.report, isAnonymous: values.isAnonymous });
        return;
      }

      switch (result.error) {
        case "VALIDATION_ERROR": {
          const other = applyFieldErrors(setError, result.fieldErrors, REPORT_FIELDS);
          if (result.fieldErrors?.photoKey) {
            updateSelectedPhoto({ photoKey: undefined, error: "Attach the photo again, or remove it." });
          }
          setFormMessage({ text: other[0] ?? "Some details need fixing. Check the highlighted fields." });
          break;
        }
        case "UPLOAD_NOT_FOUND":
          updateSelectedPhoto({
            photoKey: undefined,
            error: "We couldn't attach your photo. Try again, or submit without it.",
          });
          break;
        case "UNAUTHENTICATED":
          setFormMessage({
            text: "Your session has ended. Sign in again in a new tab, then come back and submit. Your answers are still here.",
            signInLink: true,
          });
          break;
        case "FORBIDDEN":
          setFormMessage({ text: "Your account can't submit reports. Sign in with a student account." });
          break;
        default:
          setFormMessage({
            text: "We couldn't save your report. Your answers are still here, so try submitting again.",
          });
      }
    } catch {
      setFormMessage({
        text: "We couldn't reach the server. Check your connection and try again. Your answers are still here.",
      });
    } finally {
      skipPhoto.current = false;
      inFlight.current = false;
      setStage("idle");
    }
  }

  function submitWithoutPhoto() {
    skipPhoto.current = true;
    void handleSubmit(onSubmit, () => {
      skipPhoto.current = false;
    })();
  }

  if (submitted) {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col gap-4 rounded-lg border border-emerald-300 bg-success-tint p-5 outline-none sm:p-6"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-ink">Report submitted</h2>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
          <dt className="font-medium text-text-secondary">Reference</dt>
          <dd className="font-mono font-semibold text-ink">{reportReference(submitted.id)}</dd>
          <dt className="font-medium text-text-secondary">Status</dt>
          <dd className="text-ink">{STATUS_LABELS[submitted.status]}</dd>
          <dt className="font-medium text-text-secondary">Submitted</dt>
          <dd className="text-ink">{formatDateTime(submitted.createdAt)}</dd>
        </dl>
        <p className="text-sm text-text-primary">
          Your report has been saved and staff will review it.
          {submitted.isAnonymous
            ? " Your name and email won't be shown to the staff who review it."
            : ""}
        </p>
        <p className="text-sm text-text-secondary">
          Soro doesn&apos;t alert responders. If anyone is in danger,{" "}
          <Link href="/emergency" className="font-semibold text-brand underline">
            call for help
          </Link>
          .
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/report/${reportReference(submitted.id)}`}
            className={buttonVariants({ variant: "default" })}
          >
            View report details
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline" })}
          >
            Go to my dashboard
          </Link>
          <Button type="button" variant="ghost" onClick={() => setSubmitted(null)}>
            Submit another report
          </Button>
        </div>
      </div>
    );
  }

  const busy = stage !== "idle";

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      className="flex flex-col gap-6"
    >
      {formMessage ? (
        <div ref={messageRef} tabIndex={-1} className="outline-none">
          <Alert variant="danger" role="alert">
            {formMessage.text}
            {formMessage.signInLink ? (
              <>
                {" "}
                <a
                  href="/login?callbackUrl=%2Freport%2Fnew"
                  target="_blank"
                  rel="noopener"
                  className="font-semibold text-brand underline"
                >
                  Sign in (opens a new tab)
                </a>
              </>
            ) : null}
          </Alert>
        </div>
      ) : null}

      <FormField
        id="title"
        label="Title"
        required
        hint="A short summary, for example “Phone stolen at the library”."
        error={errors.title?.message}
      >
        {(c) => <Input {...c} {...register("title")} maxLength={REPORT_LIMITS.title.max} />}
      </FormField>

      <FormField
        id="description"
        label="What happened?"
        required
        hint="Include what you saw, when it happened, and anyone involved if relevant. You don't need to include your own personal details."
        error={errors.description?.message}
      >
        {(c) => (
          <Textarea {...c} {...register("description")} rows={6} maxLength={REPORT_LIMITS.description.max} />
        )}
      </FormField>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="location" className="text-sm font-semibold text-ink">
            Location
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleDetectLocation()}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-surface-muted hover:border-brand/40 disabled:opacity-60"
            >
              {isLocating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" aria-hidden="true" />
              ) : (
                <Crosshair className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              )}
              {isLocating ? "Finding you…" : "Current GPS"}
            </button>
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-surface-muted hover:border-brand/40"
            >
              <Map className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              Pick on map
            </button>
          </div>
        </div>

        <p id="location-hint" className="text-sm text-text-secondary">
          As specific as you can: building, hall, faculty, room, or nearest landmark.
        </p>

        <Input
          id="location"
          {...register("location")}
          aria-describedby={errors.location ? "location-error" : "location-hint"}
          maxLength={REPORT_LIMITS.location.max}
          placeholder="e.g. Hezekiah Library 2nd Floor, or Moremi Block A"
        />

        {locationError ? (
          <p className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900" role="alert">
            {locationError}
          </p>
        ) : null}

        {errors.location ? (
          <p id="location-error" className="text-sm font-medium text-danger">
            {errors.location.message}
          </p>
        ) : null}

        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          <span className="shrink-0 text-[11px] font-medium text-text-muted">Quick landmarks:</span>
          {QUICK_LANDMARKS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setValue("location", `${name}, OAU Campus`, { shouldValidate: true })}
              className="shrink-0 rounded-full border border-border/80 bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-ink transition-colors hover:border-gold hover:bg-warm-cream"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <FormField id="incidentType" label="Incident type" required error={errors.incidentType?.message}>
        {(c) => (
          <Select {...c} {...register("incidentType")} defaultValue="">
            <option value="" disabled>
              Choose a type
            </option>
            {INCIDENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={errors.urgency ? "urgency-error" : undefined}
      >
        <legend className="text-sm font-semibold text-ink">
          How urgent is it?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {URGENCY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex min-h-[44px] cursor-pointer gap-3 rounded-md border border-border bg-white p-3 transition-colors hover:bg-surface-muted has-checked:border-brand has-checked:bg-brand-tint has-focus-visible:ring-2 has-focus-visible:ring-gold"
            >
              <input
                type="radio"
                value={option.value}
                {...register("urgency")}
                className="mt-1 h-4 w-4 shrink-0 accent-brand"
              />
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-ink">{option.label}</span>
                <span className="text-sm text-text-secondary">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.urgency ? (
          <p id="urgency-error" className="text-sm font-medium text-danger">
            {errors.urgency.message}
          </p>
        ) : null}
        {urgency === "CRITICAL" ? (
          <Alert variant="warning">
            If someone is in danger right now, call for help before finishing this
            report.{" "}
            <Link href="/emergency" className="font-semibold text-brand underline">
              See emergency contacts
            </Link>
            .
          </Alert>
        ) : null}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white p-3 has-focus-visible:ring-2 has-focus-visible:ring-gold">
          <input
            type="checkbox"
            {...register("isAnonymous")}
            aria-describedby="anonymous-hint"
            className="mt-1 h-4 w-4 shrink-0 accent-brand"
          />
          <span className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-ink">
              Report anonymously <span className="font-normal text-text-muted">(optional)</span>
            </span>
            <span id="anonymous-hint" className="text-sm text-text-secondary">
              Soro won&apos;t show your name or email to the staff who review this
              report. It stays linked to your account so you can follow it, and
              system administrators with direct database access could see that link.
            </span>
          </span>
        </label>
      </div>

      <PhotoField
        photo={photo}
        disabled={busy}
        onSelect={selectPhoto}
        onRemove={removePhoto}
        onSubmitWithoutPhoto={submitWithoutPhoto}
      />

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" disabled={busy} aria-disabled={busy} className="w-full sm:w-auto">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {stage === "uploading"
            ? "Uploading photo…"
            : stage === "saving"
              ? "Submitting report…"
              : "Submit report"}
        </Button>
        <p aria-live="polite" className="sr-only">
          {stage === "uploading" ? "Uploading photo" : stage === "saving" ? "Submitting report" : ""}
        </p>
      </div>

      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={(loc: string) => setValue("location", loc, { shouldValidate: true })}
        initialLocation={currentLocationValue}
      />
    </form>
  );
}
