import { z } from "zod";

// bcrypt only uses the first 72 bytes of a password, so cap the length there.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .max(254, "Email address is too long.")
  .pipe(z.email("Enter a valid email address."));

export const signInSchema = z.strictObject({
  email: emailField,
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(PASSWORD_MAX_LENGTH, "Password is too long."),
});

export const registerSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(2, "Enter your name (at least 2 characters).")
      .max(80, "Name must be 80 characters or fewer."),
    email: emailField,
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
