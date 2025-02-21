'user server';

import { getConnection } from "@/lib/db";

export async function getMessagesByUserId(user1_Id: string, user2_Id : string) {
    try {
        const query = `
            SELECT 
                dm.id,
                dm.message,
                dm.sent_at,
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

export async function insertDirectMessage(user1_Id: string, user2_Id : string) {
    try {
        const insertQuery = `
            INSERT INTO direct_message (sender_id, recipient_id, message)
            VALUES ($1, $2, 'Hello, how are you?');
        `

        const conn = await getConnection();

        await conn.query(insertQuery, [user1_Id, user2_Id]);


    }catch {
        return null;

}
}




   