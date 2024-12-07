"use server";

import { z } from "zod";
import { getConnection } from "@/lib/db";
import { registrationSchema } from "@/lib/zod";
import { hashPassword } from "./utils";
import { signIn, signOut } from "@/auth";
import { User } from "../types";

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

export async function getUserFromPasswordAndEmail(password: string, email: string) {
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
    } catch (error) {
        throw new Error("Invalid credentials.");
    }
}

export async function signOutUser() {
    await signOut();
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
    } catch 
    {
        return null;
    }
}
