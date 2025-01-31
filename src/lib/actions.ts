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
  const validatedFields = CreateToolFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    deposit: formData.get("deposit"),
    max_borrow_days: formData.get("max_borrow_days"),
    location: formData.get("location"),
    images: formData.getAll("images"),
    categories: formData.getAll("categories"),
  });

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
