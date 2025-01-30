"use server";

import { CreateToolFormSchema } from "@/lib/zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ToolState = {
  errors?: {
    name?: string[];
    description?: string[];
    deposit?: string[];
    max_borrow_days?: string[];
    location?: string[];
    images?: string[];
    categories?: string[];
  };
  message?: string | null;
};

export async function createTool(prevState: ToolState, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  console.log(data);
  const validatedFields = CreateToolFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors,
      message: "Missing fields, failed to create Tool.",
    };
  }

  try {
    console.log(validatedFields.data);
  } catch (error) {
    return {
      message: "Database Error: Failed to create Tool.",
    };
  }

  revalidatePath("/tools");
  redirect("/tools");
}
