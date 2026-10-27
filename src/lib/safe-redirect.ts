import type { Role } from "@/generated/prisma/enums";

const BLOCKED_PREFIXES = ["/api/", "/login", "/register"];

/**
 * Returns a same-origin path for post-sign-in redirects, or the fallback.
 * Prevents open redirects such as "//evil.example" or "https://evil.example".
 */
export function safeCallbackPath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  try {
    const base = "http://soro.local";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (BLOCKED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
      return fallback;
    }
    return path;
  } catch {
    return fallback;
  }
}

/** Where to land after sign-in when no callback is given. */
export function defaultPathForRole(role: Role): string {
  return role === "ADMIN" ? "/admin" : "/report/new";
}
