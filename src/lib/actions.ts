"use server";

import { auth } from "@/auth";
import { getUserRowFromEmail } from "@/lib/auth/actions";
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
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return {
        message: "Failed to get user from session",
        fields: validatedFields.data,
      };
    }
    const user_row = await getUserRowFromEmail(session.user.email);
    if (!user_row) {
      return {
        message: "Failed to get user from session",
        fields: validatedFields.data,
      };
    }
    const current_user = user_row.rows[0];

    const conn = await getConnection();
    const insertPostQuery = `
        INSERT INTO "post" (user_id, tool_name, description, deposit, max_borrow_days, location_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;
    const result = await conn.query(insertPostQuery, [
      current_user.id,
      validatedFields.data.name,
      validatedFields.data.description,
      validatedFields.data.deposit,
      validatedFields.data.max_borrow_days,
      1,
      "",
    ]);

    // insert post -> category links
    const insertCategoriesQuery = `INSERT INTO "post_category" (category_id, post_id)
                                   VALUES ($1, $2)`;
    for (const category_id of validatedFields.data.categories) {
      await conn.query(insertCategoriesQuery, [
        parseInt(category_id),
        result.rows[0].id,
      ]);
    }

    //insert post -> image links
    const insertImagesQuery = `INSERT INTO "post_picture" (post_id, source)
                               VALUES ($1, $2)`;
    for (const image_url of validatedFields.data.image_urls) {
      await conn.query(insertImagesQuery, [result.rows[0].id, image_url]);
    }
  } catch (error) {
    console.log(error);
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
