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
  fields?: Record<string, string | string[] | number>;
};

export async function createPostImage(post_id: number, post_image_url: string) {
  const conn = await getConnection();
  const query = `INSERT INTO "post_picture" (post_id, source)
                 VALUES ($1, $2)`;
  await conn.query(query, [post_id, post_image_url]);
}

export async function createPostCategory(post_id: number, category_id: number) {
  const conn = await getConnection();
  const query = `INSERT INTO "post_category" (category_id, post_id)
                 VALUES ($1, $2)`;
  await conn.query(query, [category_id, post_id]);
}

export async function getLocationIdFromPostcode(postcode: string) {
  const conn = await getConnection();
  const query = `SELECT id
                 from "location"
                 WHERE postcode = $1`;
  const result = await conn.query(query, [postcode]);
  return result;
}

export async function createLocationFromPostcode(postcode: string) {
  const geocodedPostcode = await getGeocodeFromPostcode(postcode);
  console.log(geocodedPostcode.geometry);
  const { lat, lng } = geocodedPostcode.results[0].geometry.location;

  const conn = await getConnection();
  const query = `INSERT INTO "location" (postcode, latitude, longitude)
                 VALUES ($1, $2, $3) RETURNING id`;
  const result = await conn.query(query, [postcode, lat, lng]);
  return result;
}

export async function createTool(
  prevState: ToolState,
  formData: FormData,
): Promise<ToolState> {
  const data = {
    ...Object.fromEntries(formData),
    images: formData.getAll("images"),
  };
  // TODO: add validation for queries and geocoding
  // VALIDATE FORM DATA
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

  // GET CURRENT USER
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
    let location_id;
    // CHECK IF LOCATION ALREADY EXISTS IN DB
    const location_result = await getLocationIdFromPostcode(
      validatedFields.data.location,
    );
    if (!location_result || location_result.rows.length === 0) {
      // CREATE LOCATION IF NOT EXISTS
      const new_location_result = await createLocationFromPostcode(
        validatedFields.data.location,
      );
      location_id = new_location_result.rows[0].id;
    } else {
      location_id = location_result.rows[0].id;
    }

    // CREATE POST TABLE ENTRY
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
      location_id,
      "",
    ]);

    // CREATE POST CATEGORY LINKS
    for (const category_id of validatedFields.data.categories) {
      createPostCategory(result.rows[0].id, parseInt(category_id));
    }

    // CREATE POST IMAGE LINKS
    for (const image_url of validatedFields.data.image_urls) {
      await createPostImage(result.rows[0].id, image_url);
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

export async function getTools() {
  const conn = await getConnection();
  const query = `
      SELECT id,
             user_id,
             tool_name,
             description,
             deposit,
             max_borrow_days,
             location_id,
             status
      FROM "post"
  `;
  const result = await conn.query(query);

  return result.rows;
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

export async function getCategoriesFromPostId(post_id: string) {
  const conn = await getConnection();
  const query = `
      SELECT *
      FROM "category"
      WHERE post_id = $1`;
  const result = await conn.query(query, [post_id]);
  return result.rows;
}

export async function getPostImagesFromPostId(post_id: string) {
  const conn = await getConnection();
  const query = `
      SELECT *
      FROM "post_picture"
      WHERE post_id = $1`;
  const result = await conn.query(query, [post_id]);
  return result.rows;
}

export async function getGeocodeFromPostcode(postcode: string) {
  const request = `https://maps.googleapis.com/maps/api/geocode/json?address=${postcode}&key=${process.env.GOOGLE_MAPS_API_KEY as string}`;
  const result = await fetch(request);
  return result.json();
}
