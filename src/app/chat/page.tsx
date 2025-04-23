import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatComponent from "@/components/ChatComponent";
import { getUserRowFromEmail } from "@/lib/auth/actions";
import { getAllConversations, getConversation, getMessagesByUserId } from "@/lib/actions";


// Function to map conversation messages into a desired format.
// [ sender: string; recipient: number; message: string ]
function mapMessages(messages: { sender_username: string; recipient_username: number; message: string }[]): { sender: string; recipient: number; message: string }[] {
  return messages.map((msg) => ({
    sender: msg.sender_username,
    recipient: msg.recipient_username,
    message: msg.message,
  }));
}

export default async function Chat({ searchParams,}: { searchParams: Promise<{ first_username?: string }> }) {

  const first_username = (await searchParams).first_username;
  let currentUserId = ""

  // Verify user is logged in
  // if not redirect to home page
  const session = await auth();
  if (!session?.user) {
      redirect('/auth/login');
  }
  const userInfo = await getUserRowFromEmail(session.user.email as string);
  if (!userInfo) {
      redirect('/auth/login');
  }

  // Get the signed-in user id
  currentUserId = userInfo.rows[0].id;

  // Get all conversations between signed-in user and others
  let allConversations = await getAllConversations(currentUserId);
  if (!allConversations) {
    allConversations = [];
  }

  const conversationInfo = await  getConversation(currentUserId, allConversations[0]?.recipient_user_id);

  // Get messages from the conversations
  let messages = await getMessagesByUserId(conversationInfo?.user1_id, conversationInfo?.user2_id);
  if (!messages) {
    messages = [];
  }

  // Format the messages for ChatComponent.tsx to be able to manipulate them
  const formattedMessages = mapMessages(messages);

  return (
    <div>
      <div className="">
        <title>Chat page</title>
        <ChatComponent
          first_username={first_username || ""}
          initialMessages={formattedMessages} 
          userName={userInfo.rows[0].username} 
          initialConversationID={conversationInfo?.id} 
          initialRecipient={allConversations[0]?.recipient_username} 
          allConversations={allConversations} 
          currentUserId={userInfo.rows[0].id} />    
      </div>
    </div>
);};





