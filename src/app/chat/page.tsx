import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatComponent from "@/components/ChatComponent";
import { getUserRowFromEmail } from "@/lib/auth/actions";
import { getAllConversations, getConversation, getMessagesByUserId } from "@/lib/actions";


function mapMessages(messages: any[]): { sender: string; recipient: number; message: string }[] {
  return messages.map((msg) => ({
    sender: msg.sender_username,
    recipient: msg.recipient_username,
    message: msg.message,
  }));
}

export default async function Chat() {

  const session = await auth();
  if (!session?.user) {
      redirect('/auth/login');
  }

  const userInfo = await getUserRowFromEmail(session.user.email as string);
  if (!userInfo) {
      redirect('/auth/login');
  }

  const allConversations = await getAllConversations(userInfo.rows[0].id);

  const conversationInfo = await  getConversation(userInfo.rows[0].id, "39");

  let messagesInfo = await getMessagesByUserId(conversationInfo.user1_id, conversationInfo.user2_id);
  if (!messagesInfo) {
    messagesInfo = [];
  }
  const formattedMessages = mapMessages(messagesInfo);

  return (
    <div>
      <div className="w-full max-w-3xl mx-auto">
        <title>Chat page</title>
        <ChatComponent initialMessages={formattedMessages} userName={userInfo.rows[0].username} 
        conversationID={conversationInfo.id} initialRecipient={conversationInfo.user2_id} 
        allConversations={allConversations} currentUserId={userInfo.rows[0].id} />    

        
      </div>
    </div>
  );
}





