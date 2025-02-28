'use server';

import { getConnection } from "@/lib/db";

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
                recipient.username AS recipient_username
            FROM 
                direct_message dm
            JOIN 
                "user" sender ON dm.sender_id = sender.id
            JOIN 
                "user" recipient ON dm.recipient_id = recipient.id
            WHERE 
                (dm.sender_id = $1 AND dm.recipient_id = $2) OR 
                (dm.sender_id = $2 AND dm.recipient_id = $1)
            ORDER BY 
                dm.sent_at;
        `

        const conn = await getConnection();

        const result = await conn.query(query, [user1_Id, user2_Id]);

        if (!result.rows) {
            return null;
        }

        return result.rows;

    }catch {
        return null;

}
}

export async function insertDirectMessage(user1: string, user2 : string, msg : string) {
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

        await conn.query(insertQuery, [String(user1_id.rows[0].id), user2, msg]);


    }catch {
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
            SELECT *
            FROM conversation
            WHERE user1_id = $1 OR user2_id = $1;
        `

        const conn = await getConnection();

        const conversations = await conn.query(query, [user_id]);

        return conversations.rows;

    }catch {
        return null;

}
}




   