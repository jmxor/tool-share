import { auth } from "@/auth";
import ChatComponent from "@/components/ChatComponent";
import { redirect } from "next/navigation";
import { getUserByEmail, getUserRowFromEmail } from "@/lib/auth/actions";
import { getMessagesByUserId } from "@/lib/actions";

function mapMessages(messages: any[]): { sender: string; message: string }[] {
  return messages.map((msg) => ({
    sender: msg.sender_username || 'Unknown', // Get sender name
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

  const messagesInfo = await getMessagesByUserId(userInfo.rows[0].id as string, "33");
  if (!messagesInfo) {
      console.log("No messages found.")
  }

  const formattedMessages = mapMessages(messagesInfo);

  return (
    <div>
      <div className="w-full max-w-3xl mx-auto">
        <title>Chat page</title>
        <ChatComponent initialMessages={formattedMessages}  userName={userInfo.rows[0].username} room={"room"} />
      </div>
    </div>
  );
}

async function fetchInitialMessages() {
  // Replace this with actual database fetching logic
  return [
    { sender: "Alice", message: "Hello!" },
    { sender: "Bob", message: "Hi there!" },
  ];
}

