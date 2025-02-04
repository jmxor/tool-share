import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z
    .string({ required_error: "Email is a required field." })
    .min(1, "Email is a required field.")
    .email("Provided email is invalid."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required")
    .min(8, "Password must be between 8 and 32 characters long.")
    .max(32, "Password must be less than 32 characters."),
});

export const RegisterFormSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required.")
      .max(32, "Username cannot be longer than 32 characters")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Username can only contain letters and numbers.",
      ),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const CreateToolFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  deposit: z
    .number({ required_error: "Deposit is required.", coerce: true })
    .positive("Must be greater than 0.")
    .multipleOf(0.01, "Max 2 decimal places."),
  max_borrow_days: z
    .number({
      required_error: "Borrow limit is required",
      coerce: true,
    })
    .positive("Must be greater than 0.")
    .int("Must be a whole number"),
  location: z.string().min(1, "Location is required."),
  images:
    typeof window === "undefined"
      ? z.any()
      : z
        .instanceof(FileList, { message: "At least 1 image is required." })
        .refine(
          (files) => files?.[0]?.name != "",
          "At least 1 image is required",
        ),
  categories: z.string().min(1, "At least 1 category is required."),
});
