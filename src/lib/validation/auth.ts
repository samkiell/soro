import { z } from "zod";

// bcrypt only uses the first 72 bytes of a password, so cap the length there.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const OAU_STUDENT_DOMAIN = "@student.oauife.edu.ng";
export const OAU_STAFF_DOMAIN = "@oauife.edu.ng";

export function isOAUEmail(email: string): boolean {
  const norm = email.trim().toLowerCase();
  return norm.endsWith(OAU_STUDENT_DOMAIN) || norm.endsWith(OAU_STAFF_DOMAIN);
}

const studentEmailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your OAU student email address.")
  .max(254, "Email address is too long.")
  .pipe(z.email("Enter a valid email address."))
  .refine(
    (val) => val.endsWith(OAU_STUDENT_DOMAIN) || val.endsWith(OAU_STAFF_DOMAIN),
    {
      message:
        "Only official OAU emails (e.g. yourname@student.oauife.edu.ng) are permitted.",
    },
  );

export const matricNumberField = z
  .string()
  .trim()
  .toUpperCase()
  .min(4, "Enter your student matric number (e.g. 2023/001).")
  .max(25, "Matric number must be 25 characters or fewer.")
  .regex(/^[A-Z0-9/_-]+$/, "Matric number can only contain letters, numbers, and slashes.");

export const signInSchema = z
  .object({
    identifier: z.string().trim().optional(),
    email: z.string().trim().optional(),
    password: z
      .string()
      .min(1, "Enter your password.")
      .max(PASSWORD_MAX_LENGTH, "Password is too long."),
  })
  .transform((data, ctx) => {
    const raw = (data.identifier || data.email || "").trim();
    if (!raw) {
      ctx.addIssue({
        code: "custom",
        message: "Enter your matric number or OAU email.",
        path: ["identifier"],
      });
      return z.NEVER;
    }
    return {
      identifier: raw,
      email: raw.toLowerCase(),
      password: data.password,
    };
  });

export const registerSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name (at least 2 characters).")
      .max(80, "Name must be 80 characters or fewer."),
    matricNumber: matricNumberField,
    email: studentEmailField,
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.input<typeof signInSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
