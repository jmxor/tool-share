"use server";

import { getConnection } from "@/lib/db";
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
  fields?: Record<string, string>;
};

export async function createTool(
  prevState: ToolState,
  formData: FormData,
): Promise<ToolState> {
  const data = {
    ...Object.fromEntries(formData),
    images: formData.getAll("images"),
  };

  const validatedFields = CreateToolFormSchema.safeParse(data);

  if (!validatedFields.success) {
    console.log(formData);
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error?.flatten().fieldErrors,
      message: "Missing fields, failed to create Tool.",
      fields: validatedFields.data,
    };
  }

  try {
    // const conn = await getConnection();
    // const insertQuery = `
    //         INSERT INTO "post" (user_id, tool_name, description, deposit, max_borrow_days, location_id, status)
    //         VALUES ($1, $2, $3, $4)
    //     `;
    // await conn.query(insertQuery, [2, validatedFields.data.name, validatedFields.data.description, validatedFields.data.deposit, validatedFields.data.max_borrow_days, , ""]);

    console.log(formData);
    console.log(validatedFields.data);
  } catch (error) {
    return {
      message: "Database Error: Failed to create Tool.",
    };
  }

  revalidatePath("/tools");
  redirect("/tools");
}

export async function getPostCategories() {
  const conn = await getConnection();
  const query = `
      SELECT id, name
      FROM "category"
  `;
  const result = await conn.query(query);

  return result.rows;
}
