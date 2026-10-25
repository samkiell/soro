import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Shows server-side field errors on the matching inputs. Returns any messages for
 * fields the form doesn't have, so they can be shown in a form-level message.
 */
export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: Record<string, string[]> | undefined,
  fields: readonly Path<T>[],
): string[] {
  const unmatched: string[] = [];
  let focused = false;
  for (const [field, messages] of Object.entries(fieldErrors ?? {})) {
    const message = messages[0];
    if (!message) continue;
    if ((fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: "server", message }, { shouldFocus: !focused });
      focused = true;
    } else {
      unmatched.push(message);
    }
  }
  return unmatched;
}
