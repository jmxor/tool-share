"use server";

import { z } from "zod";
import { getConnection } from "@/lib/db";
import { LoginFormSchema, RegisterFormSchema } from "@/lib/zod";
import { hashPassword } from "./utils";
import { signIn, signOut } from "@/auth";
import { User } from "../types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type LoginFormState = {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string | null;
    fields?: Record<string, string>;
    success?: boolean;
};

export async function loginUser(
    _: LoginFormState,
    formData: FormData,
): Promise<LoginFormState> {
    const data = {
        ...Object.fromEntries(formData),
    };

    const validatedFields = LoginFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error?.flatten().fieldErrors,
            message: "Missing fields, failed to log in.",
            fields: validatedFields.data,
            success: false
        };
    }

    try {
        // This function throws an error if credentials are incorrect so return is done in catch.
        await signIn("credentials", {
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            redirect: false
        });

    } catch {
        return {
            message: "Incorrect credentials. Try again.",
            success: false
        };
    }

    revalidatePath("/");
    redirect('/');
}

export type RegisterFormState = {
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
    _: RegisterFormState,
    formData: FormData,
): Promise<RegisterFormState> {
    const data = {
        ...Object.fromEntries(formData),
    };

    const validatedFields = RegisterFormSchema.safeParse(data);

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

// export async function registerUserr(formData: FormData): Promise<string> {
//     const data = Object.fromEntries(formData.entries());
// 
//     try {
//         const parsedData = registrationSchema.parse(data);
//         const conn = await getConnection();
// 
//         const checkQuery = `
//             SELECT username, email 
//             FROM "user" 
//             WHERE username = $1 OR email = $2
//             LIMIT 1
//         `;
//         const result = await conn.query(checkQuery, [parsedData.username, parsedData.email]);
// 
//         if (result.rowCount !== null && result.rowCount > 0) {
//             const row = result.rows[0];
//             if (row.username === parsedData.username) {
//                 return "Username is already registered.";
//             }
//             if (row.email === parsedData.email) {
//                 return "Email is already registered.";
//             }
//         }
// 
//         const insertQuery = `
//             INSERT INTO "user" (username, email, password_hash, user_privilege) 
//             VALUES ($1, $2, $3, $4)
//         `;
//         const hashedPassword = await hashPassword(parsedData.password);
//         await conn.query(insertQuery, [parsedData.username, parsedData.email, hashedPassword, "user"]);
// 
//         return "Success";
//     } catch (error) {
//         if (error instanceof z.ZodError) {
//             const errorMessages = error.issues.map(issue => issue.message).join(", ");
//             return errorMessages;
//         }
// 
//         console.error(error);
//         return "Failed to register unexpectedly.";
//     }
// }

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
