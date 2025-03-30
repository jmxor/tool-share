"use server";

import { redirect } from "next/navigation";
import { getEmailID } from "@/lib/auth/actions";
import { auth } from "@/auth";
import { getConnection } from "@/lib/db";
import { BorrowRequest } from "../types";
import { 
    PagedRequestResult, 
    PagedTransactionResult,
    TransactionData
} from "./types";

export async function requestTransaction(tool_id: number, requested_length: number) {
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/login");

    const userID = await getEmailID(session.user.email);
    if (!userID) redirect("/auth/login");

    try {
      const conn = await getConnection();
  
      // Check if the tool exists and is available
      const checkAvailabilityQuery = `
        SELECT p.id, p.user_id
        FROM post p
        WHERE p.id = $1 AND p.status = 'available'
      `;
      
      const checkAvailabilityResult = await conn.query(checkAvailabilityQuery, [tool_id]);
      if (checkAvailabilityResult.rows.length === 0) {
        return {
          success: false,
          message: "Tool is not available for borrowing"
        };
      }

      const toolOwnerId = checkAvailabilityResult.rows[0].user_id;
      if (toolOwnerId === userID) {
        return {
          success: false,
          message: "You cannot borrow your own tool"
        };
      }
      
      // Check for existing requests
      const checkExistingRequestQuery = `
        SELECT 1
        FROM borrow_request
        WHERE requester_id = $1 AND post_id = $2 AND status IN ('pending', 'approved', 'active')
      `;
      const existingRequestResult = await conn.query(checkExistingRequestQuery, [userID, tool_id]);
      
      // Check for existing transactions
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
  
      // Create the borrow request
      const query = `
        INSERT INTO borrow_request (requester_id, post_id, requested_length, status)
        VALUES ($1, $2, $3 * INTERVAL '1 day', 'pending')
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
        p.deposit::numeric,
        p.status as tool_status,
        u.username as owner_username,
        u.first_username as owner_first_username,
        req.username as requester_username,
        req.first_username as requester_first_username,
        u.id as owner_id
      FROM borrow_request br
      JOIN post p ON br.post_id = p.id
      JOIN "user" u ON p.user_id = u.id
      JOIN "user" req ON br.requester_id = req.id
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
        request_status: request.request_status,
        result: request.result,
        tool_name: request.tool_name,
        deposit: request.deposit,
        tool_status: request.tool_status,
        owner_username: request.owner_username,
        owner_first_username: request.owner_first_username,
        requester_username: request.requester_username,
        requester_first_username: request.requester_first_username,
        owner_id: request.owner_id
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

    const checkQuery = `
      SELECT 
        br.id,
        br.post_id,
        br.requester_id,
        br.requested_length,
        br.status as request_status,
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
    
    if (result === 'cancelled') {
      if (requestData.requester_id !== userID) {
        return {
          success: false,
          message: "You are not authorized to cancel this request"
        };
      }
      
      if (requestData.request_status !== 'pending') {
        return {
          success: false,
          message: "This request cannot be cancelled anymore"
        };
      }
    } else {
      if (requestData.owner_id !== userID) {
        return {
          success: false,
          message: "You are not authorized to resolve this request"
        };
      }
      
      if (requestData.tool_status !== 'available') {
        return {
          success: false,
          message: "This tool is no longer available"
        };
      }
      
      if (requestData.request_status !== 'pending') {
        return {
          success: false,
          message: "This request has already been processed"
        };
      }
    }

    const updateQuery = `
      UPDATE borrow_request
      SET status = $1, result = $2
      WHERE id = $3
    `;

    const newStatus = result === 'accepted' ? 'accepted' : 
                      result === 'rejected' ? 'rejected' : 
                      'cancelled';
    
    const resultBoolean = result === 'accepted' ? true : false;
                      
    const updateResult = await conn.query(updateQuery, [newStatus, resultBoolean, request_id]);
    if ((updateResult.rowCount || 0) <= 0) {
      return {
        success: false,
        message: "Failed to update request"
      };
    }

    if (result === 'accepted') {
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

      const currentDate = new Date();
      const expiresAt = new Date(currentDate);
      expiresAt.setDate(expiresAt.getDate() + requestData.requested_length.days);

      const createTransactionQuery = `
        INSERT INTO transaction (
          post_id, 
          created_at,
          borrower_id,
          transaction_status, 
          expires_at
        )
        VALUES ($1, CURRENT_TIMESTAMP, $2, 'transaction_created', $3)
        RETURNING id
      `;
      
      const transactionResult = await conn.query(createTransactionQuery, [
        requestData.post_id,
        requestData.requester_id,
        expiresAt
      ]);
      
      if ((transactionResult.rowCount || 0) <= 0) {
        return {
          success: false,
          message: "Failed to create transaction record"
        };
      }

      const updateRequestWithTransactionQuery = `
        UPDATE borrow_request
        SET transaction_id = $1
        WHERE id = $2
      `;
      
      const updateRequestResult = await conn.query(updateRequestWithTransactionQuery, [
        transactionResult.rows[0].id,
        request_id
      ]);
      
      if ((updateRequestResult.rowCount || 0) <= 0) {
        return {
          success: false,
          message: "Failed to update request with transaction ID"
        };
      }

      redirect(`/transactions/${transactionResult.rows[0].id}`);
    }

    return {
      success: true,
      message: result === 'rejected' ? "Request rejected" : 
               result === 'cancelled' ? "Request cancelled" : 
               "Request processed successfully"
    };
  } catch (error) {
    console.error("[ERROR] Failed to resolve request: ", error);
    return {
      success: false,
      message: "An error occurred while processing the request"
    };
  }
}

export async function getRequests(page: number = 1, limit: number = 10): Promise<PagedRequestResult> {
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/login");
    
    try {
        const conn = await getConnection();
        const offset = (page - 1) * limit;

        const userId = await getEmailID(session.user.email);
        if (!userId) redirect("/auth/login");
        
        const countQuery = `
            SELECT COUNT(*) as count 
            FROM borrow_request br
            JOIN post p ON br.post_id = p.id
            WHERE br.requester_id = $1 OR p.user_id = $1
        `;
        
        const countResult = await conn.query(countQuery, [userId]);
        const totalCount = parseInt(countResult.rows[0].count);
        
        const requestsQuery = `
            SELECT 
                br.id,
                br.post_id,
                br.requested_at,
                br.requested_length,
                br.status as request_status,
                br.result as result,
                br.transaction_id as transaction_id,
                p.tool_name,
                p.deposit::numeric,
                owner.id as owner_id,
                owner.username as owner_username,
                owner.first_username as owner_first_username,
                requester.id as requester_id,
                requester.username as requester_username,
                requester.first_username as requester_first_username
            FROM borrow_request br
            JOIN post p ON br.post_id = p.id
            JOIN "user" owner ON p.user_id = owner.id
            JOIN "user" requester ON br.requester_id = requester.id
            WHERE br.requester_id = $1 OR p.user_id = $1
            ORDER BY br.requested_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const requestsResult = await conn.query(requestsQuery, [userId, limit, offset]);
        
        const requests = requestsResult.rows.map(row => ({
            id: row.id,
            post_id: row.post_id,
            tool_name: row.tool_name,
            requested_at: new Date(row.requested_at),
            requested_length: { days: row.requested_length.days },
            request_status: row.request_status,
            result: row.result,
            deposit: row.deposit,
            owner: {
                id: row.owner_id,
                username: row.owner_username,
                first_username: row.owner_first_username
            },
            requester: {
                id: row.requester_id,
                username: row.requester_username,
                first_username: row.requester_first_username
            },
            transaction_id: row.transaction_id
        }));
        
        return {
            data: requests,
            totalCount,
            pageCount: Math.ceil(totalCount / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("[ERROR] Failed to fetch borrow requests:", error);
        return {
            data: [],
            totalCount: 0,
            pageCount: 0,
            currentPage: page
        };
    }
}

export async function getTransactions(page: number = 1, limit: number = 10): Promise<PagedTransactionResult> {
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/login");
    
    try {
        const conn = await getConnection();
        const offset = (page - 1) * limit;
        
        const userId = await getEmailID(session.user.email);
        if (!userId) redirect("/auth/login");
        
        const countQuery = `
            SELECT COUNT(*) as count 
            FROM transaction t
            JOIN post p ON t.post_id = p.id
            JOIN borrow_request br ON br.post_id = p.id AND br.status = 'accepted'
            WHERE p.user_id = $1 OR br.requester_id = $1
        `;
        
        const countResult = await conn.query(countQuery, [userId]);
        const totalCount = parseInt(countResult.rows[0].count);
        
        const transactionsQuery = `
            SELECT 
                t.id,
                t.post_id,
                t.created_at,
                t.borrowed_at,
                t.returned_at,
                t.transaction_status,
                t.expires_at,
                t.completed_at,
                p.tool_name,
                owner.id as owner_id,
                owner.username as owner_username,
                owner.first_username as owner_first_username,
                borrower.id as borrower_id,
                borrower.username as borrower_username,
                borrower.first_username as borrower_first_username
            FROM transaction t
            JOIN post p ON t.post_id = p.id
            JOIN "user" owner ON p.user_id = owner.id
            JOIN borrow_request br ON br.post_id = p.id AND br.status = 'accepted'
            JOIN "user" borrower ON br.requester_id = borrower.id
            WHERE p.user_id = $1 OR br.requester_id = $1
            ORDER BY t.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const transactionsResult = await conn.query(transactionsQuery, [userId, limit, offset]);
        
        const transactions = transactionsResult.rows.map(row => ({
            id: row.id,
            post_id: row.post_id,
            tool_name: row.tool_name,
            owner: {
                id: row.owner_id,
                username: row.owner_username,
                first_username: row.owner_first_username
            },
            borrower: {
                id: row.borrower_id,
                username: row.borrower_username,
                first_username: row.borrower_first_username
            },
            transaction_status: row.transaction_status,
            created_at: new Date(row.created_at),
            borrowed_at: row.borrowed_at ? new Date(row.borrowed_at) : null,
            returned_at: row.returned_at ? new Date(row.returned_at) : null,
            expires_at: new Date(row.expires_at),
            completed_at: row.completed_at ? new Date(row.completed_at) : null
        }));
        
        return {
            data: transactions,
            totalCount,
            pageCount: Math.ceil(totalCount / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("[ERROR] Failed to fetch transactions:", error);
        return {
            data: [],
            totalCount: 0,
            pageCount: 0,
            currentPage: page
        };
    }
}

export async function getTransactionDetails(transaction_id: number): Promise<{ success: boolean, transaction?: TransactionData, message?: string }> {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");

  try {
    const conn = await getConnection();

    const query = `
      SELECT 
        t.id,
        t.post_id,
        p.tool_name,
        t.created_at,
        t.borrowed_at,
        t.returned_at,
        t.transaction_status,
        o.id as owner_id,
        o.username as owner_username,
        o.first_username as owner_first_username,
        b.id as borrower_id,
        b.username as borrower_username,
        b.first_username as borrower_first_username,
        t.expires_at,
        t.completed_at
      FROM transaction t
      JOIN post p ON t.post_id = p.id
      JOIN "user" o ON p.user_id = o.id
      JOIN "user" b ON t.borrower_id = b.id
      WHERE t.id = $1
    `;

    const result = await conn.query(query, [transaction_id]);
    if ((result.rowCount || 0) <= 0) {
      return {
        success: false,
        message: "Transaction not found"
      };
    }

    const transaction = result.rows[0];

    const stepsQuery = `
      SELECT 
        user_id,
        step_type,
        completed_at
      FROM transaction_step
      WHERE transaction_id = $1
      ORDER BY completed_at
    `;

    const stepsResult = await conn.query(stepsQuery, [transaction_id]);
    const steps = stepsResult.rows.map(row => ({
      user_id: row.user_id,
      step_type: row.step_type,
      completed_at: row.completed_at ? new Date(row.completed_at) : null
    }));

    return {
      success: true,
      transaction: {
        id: transaction.id,
        post_id: transaction.post_id,
        tool_name: transaction.tool_name,
        owner: {
          id: transaction.owner_id,
          username: transaction.owner_username,
          first_username: transaction.owner_first_username
        },
        borrower: {
          id: transaction.borrower_id,
          username: transaction.borrower_username,
          first_username: transaction.borrower_first_username
        },
        transaction_status: transaction.transaction_status,
        created_at: new Date(transaction.created_at),
        borrowed_at: transaction.borrowed_at ? new Date(transaction.borrowed_at) : null,
        returned_at: transaction.returned_at ? new Date(transaction.returned_at) : null,
        expires_at: new Date(transaction.expires_at),
        completed_at: transaction.completed_at ? new Date(transaction.completed_at) : null,
        steps: steps
      }
    };
  } catch (error) {
    console.error("[ERROR] Failed to get transaction details:", error);
    return {
      success: false,
      message: "An error occurred while fetching transaction details"
    };
  }
}

export async function completeStep(step_type: string, transaction: TransactionData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");

  try {
    const conn = await getConnection();

    const query = `
      INSERT INTO transaction_step (user_id, transaction_id, step_type, completed_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `;

    const result = await conn.query(query, [userID, transaction.id, step_type]);
    if ((result.rowCount || 0) <= 0) {
      return {
        success: false,
        message: "Failed to complete step"
      };
    }

    const updateTransactionQuery = `
      UPDATE transaction
      SET transaction_status = $1
      WHERE id = $2
    `;

    await conn.query(updateTransactionQuery, [step_type, transaction.id]);

    if(step_type === "transaction_completed") {
      const updatePostStatusQuery = `
        UPDATE post
        SET status = 'available'
        WHERE id = $1
      `;
      await conn.query(updatePostStatusQuery, [transaction.post_id]);
    }

    return {
      success: true,
      message: "Step completed successfully"
    };

  } catch (error) {
    console.error("[ERROR] Failed to complete step:", error);
  }
}

async function generateCode(transaction_id: number, step_number: number) {
  const code = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  try {
    const conn = await getConnection();
    const query = `
      INSERT INTO transaction_code (transaction_id, active, code, expires_at, step_number)
      VALUES ($1, true, $2, $3, $4)
    `;
    await conn.query(query, [transaction_id, code, expiresAt, step_number]);
    return {
      code,
      expiresAt,
      step_number
    };
  } catch (error) {
    console.error("[ERROR] Failed to generate codes:", error);
  }
}

export async function getCode(transaction_id: number, step_number: number) {
  try {
    const conn = await getConnection();
    const query = `
      SELECT code, expires_at
      FROM transaction_code
      WHERE transaction_id = $1 AND step_number = $2 AND active = true AND expires_at > CURRENT_TIMESTAMP
    `;
    
    const result = await conn.query(query, [transaction_id, step_number]);
    
    if (result.rows.length > 0) {
      return {
        code: result.rows[0].code,
        expiresAt: result.rows[0].expires_at,
        step_number
      };
    } else {
      return await generateCode(transaction_id, step_number);
    }
  } catch (error) {
    console.error("[ERROR] Failed to get code:", error);
    return null;
  }
}

export async function checkCode(transaction: TransactionData, step_number: number, code: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/login");

    const userID = await getEmailID(session.user.email);
    if (!userID) redirect("/auth/login");

    const conn = await getConnection();
    const query = `
      SELECT code, expires_at
      FROM transaction_code
      WHERE transaction_id = $1 AND step_number = $2 AND code = $3 AND active = true AND expires_at > CURRENT_TIMESTAMP
    `;
    
    const result = await conn.query(query, [transaction.id, step_number, code]);
    if (result.rows.length > 0) {
      const updateQuery = `
        UPDATE transaction_code
        SET active = false
        WHERE transaction_id = $1 AND step_number = $2 AND code = $3
      `;
      await completeStep(step_number === 1 ? "tool_borrowed" : "tool_returned", transaction);
      await conn.query(updateQuery, [transaction.id, step_number, code]);

      if (step_number === 1) {
        const transactionUpdateQuery = `
          UPDATE transaction
          SET borrowed_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `;
        await conn.query(transactionUpdateQuery, [transaction.id]);
      } else if (step_number === 2) {
        const transactionUpdateQuery = `
          UPDATE transaction
          SET returned_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `;
        await conn.query(transactionUpdateQuery, [transaction.id]);
      }

      return {
        success: true,
        message: "Code is valid"
      };
    } else {
      return {
        success: false,
        message: "Invalid code"
      };
    }
  } catch (error) {
    console.error("[ERROR] Failed to check code:", error);
    return {
      success: false,
      message: "An error occurred while checking the code"
    };
  }
}