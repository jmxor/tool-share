import { z } from "zod";

export const registrationSchema = z
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

export const logInSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters.")
    .max(32, "Password must be less than 32 characters."),
});

export const CreateToolFormSchema = z.object({
  name: z.string({ required_error: "Tool name is required." }),
  description: z.string({ required_error: "Description is required." }),
  deposit: z
    .number({ required_error: "Deposit is required" })
    .positive("Deposit must not be negative."),
  max_borrow_days: z
    .number({ required_error: "A Maximum borrow period is required" })
    .positive("Maximum borrow period must be greater than 0")
    .int("Maximum borrow period must be a whole number"),
  location: z.string({ required_error: "Location is required." }),
  images: z.instanceof(File, { message: "At least one Image is required" }),
  categories: z.string().array().min(1),
});
