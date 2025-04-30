'use server';

import { getConnection } from "@/lib/db";
import { getEmailID, getFirstUsernameID, sendNotificationEmail } from "./auth/actions";

export async function checkIfConversationExists(user1_Id: string, user2_Id : string) {
    try {

        const checkQuery = `
            SELECT id 
            FROM conversation 
            WHERE (user1_id = $1 AND user2_id = $2) 
            OR (user1_id = $2 AND user2_id = $1)      
        `

        const conn = await getConnection();
        
        const result = await conn.query(checkQuery, [user1_Id, user2_Id]);

        console.log(result.rows[0].id)
        
        return result.rows[0].id;

    }catch {
        return null;

}
}
export async function getMessagesByUserId(user1_Id: string, user2_Id : string) {
    try {

        const query = `
            SELECT
                dm.id,
                dm.message,
                dm.sent_at,
                dm.sender_id,
                dm.recipient_id,
                sender.username AS sender_username,
                recipient.username AS recipient_username,
                c.id AS conversation_id  -- Include the conversation ID
            FROM
                direct_message dm
            JOIN
                "user" sender ON dm.sender_id = sender.id
            JOIN
                "user" recipient ON dm.recipient_id = recipient.id
            JOIN
                conversation c ON (
                    (c.user1_id = dm.sender_id AND c.user2_id = dm.recipient_id) OR
                    (c.user1_id = dm.recipient_id AND c.user2_id = dm.sender_id)
                )
            WHERE
                (dm.sender_id = $1 AND dm.recipient_id = $2) OR
                (dm.sender_id = $2 AND dm.recipient_id = $1)
            ORDER BY
                dm.sent_at;
        `

        const conn = await getConnection();
        const result = await conn.query(query, [user1_Id, user2_Id]);

        return result.rows;

    }catch {
        return null;

}
}

export async function insertDirectMessage(user1: string, user2: string, msg: string, timestamp: Date) {
    try {
        const query = `
                SELECT id
                FROM "user"
                WHERE username = $1;`

        
        const insertQuery = `
            INSERT INTO direct_message (sender_id, recipient_id, message)
            VALUES ($1, $2, $3);
        `

        const conn = await getConnection();

        const user1_id = await conn.query(query, [user1]);
        const user2_id = await conn.query(query, [user2]);

        await conn.query(insertQuery, [String(user1_id.rows[0].id), String(user2_id.rows[0].id), msg]);
        console.log("[TRACING] Sending message email to ", user2_id.rows[0].id);
        await sendNotificationEmail(user2_id.rows[0].id, "messages", `You have received a message from ${user1}.`);

    } catch {
        return null;
    }
}

export async function getConversation(user1: string, user2 : string) {
    try {

        const query = `
            SELECT *
            FROM conversation
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1);
        `

        const conn = await getConnection();

        const conversation = await conn.query(query, [user1, user2]);

        return conversation.rows[0];

    }catch {
        return null;

}
}

export async function getAllConversations(user_id: string) {
    try {

        const query = `
            SELECT 
                c.id AS id,
                CASE 
                    WHEN c.user1_id = $1 THEN c.user1_id
                    ELSE c.user2_id
                END AS current_user_id,
                CASE 
                    WHEN c.user1_id = $1 THEN c.user2_id
                    ELSE c.user1_id
                END AS recipient_user_id,
                CASE 
                    WHEN c.user1_id = $1 THEN u2.username
                    ELSE u1.username
                END AS recipient_username
            FROM 
                conversation c
            JOIN 
                "user" u1 ON c.user1_id = u1.id
            JOIN 
                "user" u2 ON c.user2_id = u2.id
            WHERE 
                c.user1_id = $1 OR c.user2_id = $1;  -- Replace ? with your actual user ID
        `

        const conn = await getConnection();

        const conversations = await conn.query(query, [user_id]);

        return conversations.rows;

    }catch {
        return null;

}
}

export async function createConversation(user1_email : string, user2_first_username: string): Promise<number>{
    try{
        const conn = await getConnection();
        const user1_id = await getEmailID(user1_email);
        const user2_id = await getFirstUsernameID(user2_first_username);

        const checkQuery = `
            SELECT id
            FROM conversation
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1);
        `
        const checkResult = await conn.query(checkQuery, [user1_id, user2_id]);

        const insertQuery = `
            INSERT INTO conversation (user1_id, user2_id)
            VALUES ($1, $2)
            RETURNING id;
        `

        if (checkResult.rows.length < 1){
            const insertResult = await conn.query(insertQuery, [user1_id, user2_id])
            return insertResult.rows[0]
        }
       
        return checkResult.rows[0].id

    } catch(error) {
        console.error("[ERROR] Failed to create conversation:", error);
        return -1
    }
}

export async function deleteConversationAction(conversationId: number) {
    try {


        const query = `
            SELECT user1_id, user2_id
            FROM conversation
            WHERE id = $1;
        `


        const deleteMessages = `
            DELETE FROM direct_message
            WHERE (sender_id = $1 AND recipient_id = $2)
            OR (sender_id = $2 AND recipient_id = $1);
        `
        const deleteConversation = `
            DELETE FROM conversation
            WHERE (user1_id = $1 AND user2_id = $2)
            OR (user1_id = $2 AND user2_id = $1);
        `

        const conn = await getConnection();

        const result = await conn.query(query, [conversationId]);

        await conn.query(deleteMessages, [result.rows[0].user1_id, result.rows[0].user2_id]);
        await conn.query(deleteConversation, [result.rows[0].user1_id, result.rows[0].user2_id]);

        return 1;

    }catch {
        console.log("[ERROR] failed to delete Conversation!")
        return -1;

}
}






   