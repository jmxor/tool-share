"use server";

import { z } from "zod";
import { getConnection } from "@/db";
import { registrationSchema } from "@/lib/zod";
import { hashPassword } from "./utils";
import { signIn } from "@/auth";

export async function registerUser(formData: FormData): Promise<string> {
    const data = Object.fromEntries(formData.entries());
    
    try {
        const parsedData = registrationSchema.parse(data);
        const conn = await getConnection();

        const checkQuery = `
            SELECT username, email 
            FROM "user" 
            WHERE username = $1 OR email = $2
            LIMIT 1
        `;
        const result = await conn.query(checkQuery, [parsedData.username, parsedData.email]);

        if (result.rowCount !== null && result.rowCount > 0) {
            const row = result.rows[0];
            if (row.username === parsedData.username) {
                return "Username is already registered.";
            }
            if (row.email === parsedData.email) {
                return "Email is already registered.";
            }
        }

        const insertQuery = `
            INSERT INTO "user" (username, email, password_hash, user_privilege) 
            VALUES ($1, $2, $3, $4)
        `;
        const hashedPassword = await hashPassword(parsedData.password);
        await conn.query(insertQuery, [parsedData.username, parsedData.email, hashedPassword, "user"]);

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

export async function signInUser(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const result = await signIn("credentials", {
            redirect: false,
            email,
            password
        });
        
        if (result?.error) {
            return "Invalid credentials";
        }
    } catch {
        return "Invalid credentials";
    }

    return "Success";
}
