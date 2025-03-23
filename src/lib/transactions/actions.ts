"use server";

import { redirect } from "next/navigation";
import { getEmailID } from "@/lib/auth/actions";
import { auth } from "@/auth";
import { getConnection } from "@/lib/db";
import { BorrowRequest } from "../types";

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
      
      // Check if user already has a pending or active request/transaction for this tool
      const checkExistingRequestQuery = `
        SELECT 1
        FROM borrow_request
        WHERE requester_id = $1 AND post_id = $2 AND status IN ('pending', 'approved', 'active')
      `;
      const existingRequestResult = await conn.query(checkExistingRequestQuery, [userID, tool_id]);
      
      // Check if user has an active transaction for this tool
      const checkExistingTransactionQuery = `
        SELECT 1
        FROM transaction
        WHERE borrower_id = $1 AND post_id = $2 AND completed_at IS NULL
      `;
      const existingTransactionResult = await conn.query(checkExistingTransactionQuery, [userID, tool_id]);
      
      if (existingRequestResult.rows.length > 0 || existingTransactionResult.rows.length > 0) {
        return {
          success: false,
          message: "You already have an active or pending request for this tool"
        };
      }
  
      const query = `
        INSERT INTO borrow_request (requester_id, post_id, requested_length, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id
      `;
  
      const result = await conn.query(query, [userID, tool_id, requested_length]);
      const transaction_id = result.rows[0].id;

      return {
        success: true,
        transaction_id,
        message: "Transaction requested successfully"
      };
    } catch (error) {
      console.error("[ERROR] Failed to request transaction: ", error);
      return {
        success: false,
        message: "Failed to request transaction"
      };
    }
}

export type BorrowRequestData = {
  success: boolean;
  request?: BorrowRequest;
  message?: string;
}

export async function getRequestData(request_id: number): Promise<BorrowRequestData> {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");

  try {
    const conn = await getConnection();
    
    const query = `
      SELECT 
        br.id,
        br.requester_id,
        br.post_id,
        br.requested_at,
        br.requested_length,
        br.status as request_status,
        br.result,
        p.tool_name,
        p.deposit,
        p.status as tool_status,
        u.username as owner_username,
        u.first_username as owner_first_username
      FROM borrow_request br
      JOIN post p ON br.post_id = p.id
      JOIN "user" u ON p.user_id = u.id
      WHERE br.id = $1
    `;

    const result = await conn.query(query, [request_id]);
    const rowCount = result.rowCount || 0;
    if (rowCount <= 0) redirect("/transactions");
    
    const request = result.rows[0];

    return {
      success: true,
      request: {
        id: request.id,
        requester_id: request.requester_id,
        post_id: request.post_id,
        requested_at: request.requested_at,
        requested_length: request.requested_length,
        request_status: request.status,
        result: request.result,
        tool_name: request.tool_name,
        deposit: request.deposit,
        tool_status: request.tool_status,
        owner_username: request.owner_username,
        owner_first_username: request.owner_first_username
      }
    };
    
  } catch (error) {
    console.error("[ERROR] Failed to get request data: ", error);
    return {
      success: false,
      request: undefined,
      message: "Failed to get request data"
    };
  }
}

export async function resolveRequest(request_id: number, result: string) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");

  try {
    const conn = await getConnection();

    // First check if the request exists and if the user is the owner of the post
    const checkQuery = `
      SELECT 
        br.id,
        br.post_id,
        br.requester_id,
        br.requested_length,
        p.user_id as owner_id,
        p.status as tool_status
      FROM borrow_request br
      JOIN post p ON br.post_id = p.id
      WHERE br.id = $1
    `;

    const checkResult = await conn.query(checkQuery, [request_id]);
    if ((checkResult.rowCount || 0) <= 0) {
      return {
        success: false,
        message: "Request not found"
      };
    }

    const requestData = checkResult.rows[0];
    
    // Check if user is the owner of the post
    if (requestData.owner_id !== userID) {
      return {
        success: false,
        message: "You are not authorized to resolve this request"
      };
    }

    // Check if the tool is still available
    if (requestData.tool_status !== 'available') {
      return {
        success: false,
        message: "This tool is no longer available"
      };
    }

    // If all checks pass, update the request
    const updateQuery = `
      UPDATE borrow_request
      SET result = $1
      WHERE id = $2
    `;

    const updateResult = await conn.query(updateQuery, [result, request_id]);
    if ((updateResult.rowCount || 0) <= 0) {
      return {
        success: false,
        message: "Failed to resolve request"
      };
    }

    if (result === 'accepted') {
      // Update the post status to 'borrowed'
      const updatePostStatusQuery = `
        UPDATE post
        SET status = 'borrowed'
        WHERE id = $1
      `;
      const updatePostStatusResult = await conn.query(updatePostStatusQuery, [requestData.post_id]);
      if ((updatePostStatusResult.rowCount || 0) <= 0) {
        return {
          success: false,
          message: "Failed to update post status"
        };
      }

      // Create a transaction record
      const currentDate = new Date();
      const expiresAt = new Date(currentDate);
      expiresAt.setDate(expiresAt.getDate() + requestData.requested_length);

      const createTransactionQuery = `
        INSERT INTO transaction (
          post_id, 
          created_at,
          borrower_id,
          transaction_status, 
          expires_at
        )
        VALUES ($1, CURRENT_TIMESTAMP, $2, 'started', $3)
        RETURNING id
      `;
      
      const transactionResult = await conn.query(createTransactionQuery, [
        requestData.post_id,
        userID,
        expiresAt
      ]);
      
      if ((transactionResult.rowCount || 0) <= 0) {
        return {
          success: false,
          message: "Failed to create transaction record"
        };
      }

      redirect(`/transactions/${transactionResult.rows[0].id}`);
    }

    return {
      success: true,
      message: "Request rejected"
    };
  } catch (error) {
    console.error("[ERROR] Failed to resolve request: ", error);
    return {
      success: false,
      message: "An error occurred while resolving the request"
    };
  }
}