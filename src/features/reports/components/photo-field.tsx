"use client";

import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_PHOTO_TYPES, formatBytes, MAX_PHOTO_BYTES } from "@/lib/storage/image";

export type PhotoState =
  | { status: "none" }
  | {
      status: "selected";
      file: File;
      previewUrl: string;
      /** Set once the upload succeeds, so a retry doesn't upload twice. */
      photoKey?: string;
      error?: string;
    };

type PhotoFieldProps = {
  photo: PhotoState;
  disabled: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onSubmitWithoutPhoto: () => void;
};

export function PhotoField({
  photo,
  disabled,
  onSelect,
  onRemove,
  onSubmitWithoutPhoto,
}: PhotoFieldProps) {
  const error = photo.status === "selected" ? photo.error : undefined;

  return (
    <div className="flex flex-col gap-1.5" role="group" aria-labelledby="photo-label">
      <p id="photo-label" className="text-sm font-semibold text-ink">
        Photo evidence <span className="font-normal text-text-muted">(optional)</span>
      </p>
      <p id="photo-hint" className="text-sm text-text-secondary">
        Only add a photo if it was safe to take. JPEG, PNG, or WebP, up to{" "}
        {formatBytes(MAX_PHOTO_BYTES)}. Photos can contain hidden details such as
        where and when they were taken.
      </p>

      {photo.status === "none" ? (
        <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-white px-4 py-4 text-sm font-medium text-ink transition-colors hover:bg-surface-muted has-focus-visible:ring-2 has-focus-visible:ring-gold">
          <ImagePlus className="h-5 w-5 text-brand" aria-hidden="true" />
          Choose a photo
          <input
            type="file"
            accept={ACCEPTED_PHOTO_TYPES}
            disabled={disabled}
            aria-describedby="photo-hint"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSelect(file);
            }}
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-md border border-border bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img
            src={photo.previewUrl}
            alt="Preview of the selected photo"
            className="h-16 w-16 shrink-0 rounded object-cover"
          />
          <div className="min-w-0 flex-1 text-sm">
            <p className="truncate font-medium text-ink">{photo.file.name}</p>
            <p className="text-text-muted">
              {formatBytes(photo.file.size)}
              {photo.photoKey ? " · Uploaded" : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove photo"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-md border border-red-300 bg-danger-tint p-3 text-sm text-ink"
        >
          <p className="font-medium text-danger">{error}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onRemove} disabled={disabled}>
              Remove photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSubmitWithoutPhoto}
              disabled={disabled}
            >
              Submit without photo
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
