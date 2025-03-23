"use server";

import { redirect } from "next/navigation";
import { getEmailID } from "../auth/actions";
import { auth } from "@/auth";
import { getConnection } from "../db";

export async function requestTransaction(tool_id: number, requested_length: number) {
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/login");

    const userID = await getEmailID(session.user.email);
    if (!userID) redirect("/auth/login");

    try {
      const conn = await getConnection();
  
      const checkAvailabilityQuery = `
        SELECT 1
        FROM post
        WHERE id = $1 AND status = 'available'
      `;
      const checkAvailabilityResult = await conn.query(checkAvailabilityQuery, [tool_id]);
      if (checkAvailabilityResult.rows.length === 0) {
        return {
          success: false,
          message: "Tool is not available for borrowing"
        };
      }
  
      const query = `
        INSERT INTO borrow_request (requester_id, post_id, requested_length)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
  
      const result = await conn.query(query, [userID, tool_id, requested_length]);
      const transaction_id = result.rows[0].id;

      redirect(`/transactions/${transaction_id}`);
    } catch (error) {
      console.error("[ERROR] Failed to request transaction: ", error);
      return {
        success: false,
        message: "Failed to request transaction"
      };
    }
}