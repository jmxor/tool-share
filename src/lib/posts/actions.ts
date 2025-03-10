"use server";

import { auth } from "@/auth";
import { getUserRowFromEmail } from "@/lib/auth/actions";
import { getConnection } from "@/lib/db";
import { CreateToolFormSchema } from "@/lib/zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type GeocodeLocation = {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

export type GeocodeResponse = {
  results: GeocodeLocation[];
};

export async function getGeocodeFromPostcode(
  postcode: string,
): Promise<GeocodeLocation | null> {
  try {
    const request = `https://maps.googleapis.com/maps/api/geocode/json?address=${postcode}&key=${process.env.GOOGLE_MAPS_API_KEY as string}`;
    const geocode_response: GeocodeResponse = await fetch(request).then((res) =>
      res.json(),
    );
    if (geocode_response.results.length != 0) {
      return geocode_response.results[0];
    } else {
      return null;
    }
  } catch (e) {
    console.log("[ERROR] Failed to geocode postcode to Lat/Long", e);
    return null;
  }
}

export type PostImage = {
  id: number;
  post_id: number;
  source: string;
};

export async function createPostImage(
  post_id: number,
  image_url: string,
): Promise<Pick<PostImage, "id"> | null> {
  try {
    const conn = await getConnection();
    const query = `INSERT INTO "post_picture" (post_id, source)
                   VALUES ($1, $2) RETURNING id`;
    const result = await conn.query(query, [post_id, image_url]);

    if (result.rows.length != 0) {
      return result.rows[0];
    } else {
      return null;
    }
  } catch (e) {
    console.log("[ERROR] Failed to create post image", e);
    return null;
  }
}

// TODO: maybe not necessary
export async function getPostImagesFromPostId(
  post_id: string,
): Promise<PostImage[] | null> {
  try {
    const conn = await getConnection();
    const query = `
        SELECT *
        FROM "post_picture"
        WHERE post_id = $1`;
    const result = await conn.query(query, [post_id]);

    return result.rows;
  } catch (e) {
    console.error("[ERROR] Failed to get images from post id", e);
    return null;
  }
}

export type PostCategory = {
  id: number;
  category_id: number;
  post_id: number;
};

export async function createPostCategory(
  post_id: number,
  category_id: number,
): Promise<Pick<PostCategory, "id"> | null> {
  try {
    const conn = await getConnection();
    const query = `INSERT INTO "post_category" (category_id, post_id)
                   VALUES ($1, $2) RETURNING id`;
    const result = await conn.query(query, [category_id, post_id]);

    if (result.rows.length != 0) {
      return result.rows[0];
    } else {
      return null;
    }
  } catch (e) {
    console.error("[ERROR] Failed to create post category", e);
    return null;
  }
}

export type Category = {
  id: number;
  name: string;
};

export async function getCategories(): Promise<Category[] | null> {
  try {
    const conn = await getConnection();
    const query = `
        SELECT id, name
        FROM "category"
    `;
    const result = await conn.query(query);

    return result.rows;
  } catch (e) {
    console.error("[ERROR] Failed to get post categories", e);
    return null;
  }
}

export type PostLocation = {
  id: number;
  postcode: string;
  latitude: number;
  longitude: number;
};

export async function getLocationIdFromPostcode(
  postcode: string,
): Promise<Pick<PostLocation, "id"> | null> {
  try {
    const conn = await getConnection();
    const query = `SELECT id
                   from "location"
                   WHERE postcode = $1`;
    const result = await conn.query(query, [postcode]);

    if (result.rows.length != 0) {
      return result.rows[0];
    } else {
      return null;
    }
  } catch (e) {
    console.error("[ERROR] Failed to get location id from postcode", e);
    return null;
  }
}

export async function createLocationFromPostcode(
  postcode: string,
): Promise<Pick<PostLocation, "id"> | null> {
  let geocodedPostcode;
  try {
    geocodedPostcode = await getGeocodeFromPostcode(postcode);
    if (!geocodedPostcode) {
      return null;
    }
  } catch (e) {
    console.error("[ERROR] Failed to translate postcode to lat long", e);
    return null;
  }

  try {
    const conn = await getConnection();
    const { lat, lng } = geocodedPostcode.geometry.location;
    const query = `INSERT INTO "location" (postcode, latitude, longitude)
                   VALUES ($1, $2, $3) RETURNING id`;
    const result = await conn.query(query, [postcode, lat, lng]);

    if (result.rows.length != 0) {
      return result.rows[0];
    } else {
      return null;
    }
  } catch (e) {
    console.error("[ERROR] Failed to create location from postcode", e);
    return null;
  }
}

export type ToolPost = {
  id: number;
  user_id: number;
  tool_name: string;
  description: string;
  deposit: string;
  max_borrow_days: number;
  location_id: number;
  status: string;
};

export type AllToolPostData = ToolPost &
  Omit<PostLocation, "id"> & {
    categories: string;
    pictures: string;
  };

export async function getTools(): Promise<AllToolPostData[] | null> {
  try {
    const conn = await getConnection();
    const query = `
        SELECT p.*,
               string_agg(DISTINCT pp.source, ', ') AS pictures,
               string_agg(DISTINCT c.name, ', ')    AS categories,
               l.postcode,
               l.longitude,
               l.latitude
        FROM post p
                 LEFT JOIN post_picture pp ON p.id = pp.post_id
                 LEFT JOIN post_category pc ON p.id = pc.post_id
                 LEFT JOIN category c ON pc.category_id = c.id
                 LEFT JOIN location l ON p.location_id = l.id
        GROUP BY p.id, l.id
    `;
    const result = await conn.query(query);

    return result.rows;
  } catch (e) {
    console.error("[ERROR] Failed to get tools from database", e);
    return null;
  }
}

export type PostFormState = {
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

export async function createTool(
  prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const data = {
    ...Object.fromEntries(formData),
    images: formData.getAll("images"),
  };
  // VALIDATE FORM DATA
  const validatedFields = CreateToolFormSchema.safeParse(data);
  if (!validatedFields.success) {
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
    let location = await getLocationIdFromPostcode(
      validatedFields.data.location,
    );
    if (!location) {
      location = await createLocationFromPostcode(
        validatedFields.data.location,
      );

      if (!location) {
        return {
          message: "Failed to create location from Postcode",
          fields: validatedFields.data,
        };
      }
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
      location.id,
      "",
    ]);

    // CREATE POST CATEGORY LINKS
    for (const category_id of validatedFields.data.categories) {
      await createPostCategory(result.rows[0].id, parseInt(category_id));
    }

    // CREATE POST IMAGE LINKS
    for (const image_url of validatedFields.data.image_urls) {
      await createPostImage(result.rows[0].id, image_url);
    }
  } catch (error) {
    console.log(error);
    return {
      message: "Database Error: Failed to create Tool.",
      fields: validatedFields.data,
    };
  }

  revalidatePath("/tools");
  redirect("/tools");
}
