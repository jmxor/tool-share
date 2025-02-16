import { z } from "zod";

export const RegistrationFormSchema = z
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

export const LoginFormSchema = z.object({
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
  image_urls: z.union([
    z.string().array().min(1, "At least 1 Image is required."),
    z
      .string()
      .min(1, "At least 1 Image is required.")
      .transform((str) => str.split(",")),
  ]),
  categories: z.union([
    z.string().array().min(1, "At least 1 category is required."),
    z
      .string()
      .min(1, "At least 1 category is required.")
      .transform((str) => str.split(",")),
  ]),
});

export const ReviewFormSchema = z.object({
    target: z
        .string({
            required_error: "No target. Refresh page and try again."
        }),
    stars: z
        .number({
            required_error: "Please select a star rating.",
            invalid_type_error: "Star rating must be a number.",
        })
        .min(0, { message: "Rating must be at least 0 stars." })
        .max(5, { message: "Rating must be at most 5 stars." })
        .int({ message: "Rating must be an integer." }),
    text: z
        .string({
            required_error: "Please enter a review.",
            invalid_type_error: "Review must be a string.",
        })
        .min(10, { message: "Review must be at least 10 characters." })
        .max(1000, { message: "Review must be at most 1000 characters." }),
});
