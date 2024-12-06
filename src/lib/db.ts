"use server";

import { sql } from '@vercel/postgres';

export async function getConnection() {
    return sql;
}