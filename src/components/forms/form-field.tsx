import * as React from "react";
import { Label } from "@/components/ui/label";

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
};

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  children: (control: FieldControlProps) => React.ReactNode;
};

/**
 * Label, hint, and error for one control. Hint and error are linked to the control
 * with aria-describedby, so the error is read when the invalid field gets focus.
 */
export function FormField({
  id,
  label,
  required,
  hint,
  error,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}{" "}
        <span className="font-normal text-text-muted">
          {required ? "(required)" : "(optional)"}
        </span>
      </Label>
      {hint ? (
        <p id={hintId} className="text-sm text-text-secondary">
          {hint}
        </p>
      ) : null}
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
