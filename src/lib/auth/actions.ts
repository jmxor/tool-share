"use server";

import { z } from "zod";
import { getConnection } from "@/lib/db";
import { LoginFormSchema, RegistrationFormSchema } from "@/lib/zod";
import { hashPassword } from "./utils";
import { signIn, signOut } from "@/auth";
import { PublicUser, User } from "../types";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export type ReviewFormState = {
    errors?: {
        stars?: string[],
        text?: string[],
    };
    message?: string | null;
    success?: boolean;
};

export async function submitReview(
    prevState: ReviewFormState,
    formData: FormData,
): Promise<ReviewFormState> {
    const data = {
        ...Object.fromEntries(formData),
    };

    const validatedFields = RegistrationFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            message: "Invalid review text",
            success: false
        }
    }
    return {
        success: true
    }
}

export async function getPublicUserData(first_username: string): Promise<PublicUser | null> {
    try {
        const conn = await getConnection();
        const query = `
            SELECT id, username, created_at, is_suspended
            FROM "user"
            WHERE first_username = $1
        `;

        const result = await conn.query(query, [first_username]);

        if (result.rows.length == 0) {
            return null;
        }

        const row = result.rows[0];

        const suspensionCountQuery = `
            SELECT COUNT(*)
            FROM suspension
            WHERE user_id = $1
        `;

        const countResult = await conn.query(suspensionCountQuery, [row.id]);

        let suspensionCount = 0;
        if (result.rows.length !== 0) {
            suspensionCount = countResult.rows[0].count;
        }

        const publicUserData: PublicUser = {
            username: row.username,
            created_at: row.created_at,
            is_suspended: row.is_suspended,
            suspensionCount: suspensionCount
        }

        return publicUserData;

    } catch (error) {
        console.error("[ERROR] Failed to fetch public user data: ", error);

        return null;
    }
}

export type RegistrationFormState = {
    errors?: {
        username?: string[],
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
    };
    message?: string | null;
    fields?: Record<string, string>;
    success?: boolean;
};

export async function registerUser(
    _: RegistrationFormState,
    formData: FormData,
): Promise<RegistrationFormState> {
    const data = {
        ...Object.fromEntries(formData),
    };

    const validatedFields = RegistrationFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error?.flatten().fieldErrors,
            message: "Missing fields, failed to register.",
            fields: validatedFields.data,
            success: false
        };
    }

    try {
        const conn = await getConnection();

        const checkQuery = `
            SELECT id
            FROM "user"
            WHERE first_username = $1 OR email = $2
            LIMIT 1
        `;
        const result = await conn.query(checkQuery, [validatedFields.data.username.toLowerCase().replace(/\s+/g, ''), validatedFields.data.email]);

        if (result.rowCount !== null && result.rowCount > 0) {
            return {
                message: "Username or email already registered, try again.",
                success: false
            };
        }

        const insertQuery = `
            INSERT INTO "user" (username, first_username, email, password_hash, user_privilege) 
            VALUES ($1, $2, $3, $4, $5)
        `;

        const hashedPassword = await hashPassword(validatedFields.data.password);
        await conn.query(insertQuery, [validatedFields.data.username, validatedFields.data.username.toLowerCase().replace(/\s+/g, ''), validatedFields.data.email, hashedPassword, "user"]);

    } catch (error) {
        console.error('Failed to register new user: ', error);
        return {
            message: "Failed to register new user.",
            success: false
        };
    }

    revalidatePath("/auth/login");
    redirect('/auth/login');
}

export async function registerUserr(formData: FormData): Promise<string> {
    const data = Object.fromEntries(formData.entries());

    try {
        const parsedData = RegistrationFormSchema.parse(data);
        const conn = await getConnection();

        const checkQuery = `
            SELECT id
            FROM "user"
            WHERE first_username = $1 OR email = $2
            LIMIT 1
        `;
        const result = await conn.query(checkQuery, [parsedData.username.toLowerCase().replace(/\s+/g, ''), parsedData.email]);
        console.log(`Found this many users with same first_username: ${result.rowCount}`);

        if (result.rowCount !== null && result.rowCount > 0) {
            return "Username or email is already registered.";
        }

        const insertQuery = `
            INSERT INTO "user" (username, first_username, email, password_hash, user_privilege) 
            VALUES ($1, $2, $3, $4, $5)
        `;
        const hashedPassword = await hashPassword(parsedData.password);
        await conn.query(insertQuery, [parsedData.username, parsedData.username.toLowerCase().replace(/\s+/g, ''), parsedData.email, hashedPassword, "user"]);

        return "Success";
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => issue.message).join(", ");
            return errorMessages;
        }

        console.error(error);
        return "Failed to register unexpectedly.";
    }
}

export async function getUserRowFromEmail(email: string) {
    try {
        const conn = await getConnection();
        const query = `
        SELECT id, username, email, password_hash, created_at, user_privilege, is_suspended 
        FROM "user"
        WHERE email = $1
        `
        const result = await conn.query(query, [email]);

        return result;
    } catch {
        return null;
    }
}

export type LoginFormState = {
    errors?: {
        email?: string[],
        password?: string[]
    },
    message?: string | null,
    fields?: Record<string, string>,
    success?: boolean | null,
}

export async function loginUser(
    _: LoginFormState,
    formData: FormData
): Promise<LoginFormState> {
    const data = {
        ...Object.fromEntries(formData),
    }

    const validatedFields = LoginFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error?.flatten().fieldErrors,
            message: "Invalid or missing field values.",
            success: false
        }
    }

    try {
        const result = await signIn("credentials", {
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            redirect: false
        });

        if (!result) {
            throw new Error("Failed to signIn");
        }
    } catch (error) {
        console.error("[ERROR: loginUser action] Unexpected error during user log in: ", error);
        return {
            message: "Failed to login user. Try again later.",
            success: false
        }
    }

    revalidatePath("/");
    redirect("/");
}

export async function signInUser(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false
        });

        return result;
    } catch {
        throw new Error("Invalid credentials.");
    }
}

export async function signOutUser() {
    await signOut();
}

export async function deleteAccount() {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return false;
        }

        const query = `
            DELETE FROM "user"
            WHERE email = $1
        `

        const conn = await getConnection();
        const result = await conn.query(query, [session.user.email]);

        if (result.rowCount === 0) {
            console.error("Delete account query no response");
            return false;
        }

        await signOut();
        return true;

    } catch (error) {
        console.error("Delete account query error:", error);
        return false;
    }
}

export async function getUserByEmail(email: string) {
    try {
        const query = `
            SELECT username, email, created_at, user_privilege, is_suspended
            FROM "user" 
            WHERE email = $1
            LIMIT 1
        `;
        const conn = await getConnection();
        const result = await conn.query(query, [email]);

        if (!result.rows) {
            return null;
        }
        const user = result.rows[0];
        return {
            ...user,
            created_at: new Date(user.created_at),
        } as User;
    } catch {
        return null;
    }
}

export async function updateUsername(newUsername: string) {
    // Return false if empty
    if (!newUsername) {
        return false;
    }

    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return false;
        }

        const query = `
            UPDATE "user"
            SET username = $1
            WHERE email = $2
        `;

        const conn = await getConnection();
        await conn.query(query, [newUsername, session.user.email]);

        return true

    } catch {
        return false;
    }
}

export async function setPassword(newPassword: string) {
    if (!newPassword) {
        console.log("No new password.");
        return false;
    }

    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return false;
        }

        // Update on database
        const newHash = await hashPassword(newPassword);
        console.log("Hashed Password:", newHash);
        const email = session.user.email;

        const query = `
            UPDATE "user"
            SET password_hash = $1
            WHERE email = $2
        `;

        const conn = await getConnection();
        console.log("Query Values:", [newHash, email]);
        const result = await conn.query(query, [newHash, email]);

        if (!result) {
            return false;
        }

        return true;

    } catch (error) {
        console.error("Error in setPassword:", error);
        return false;
    }
}
