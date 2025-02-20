import { auth } from "@/auth";
import ChatComponent from "@/components/ChatComponent";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/lib/auth/actions";


export default async function Chat() {

  const session = await auth();
  if (!session?.user) {
      redirect('/auth/login');
  }

  const userInfo = await getUserByEmail(session.user.email as string);
  if (!userInfo) {
      redirect('/auth/login');
  }
  
  return (
    <div>
      <div className="w-full max-w-3xl mx-auto">
        <title>Chat page</title>
        <ChatComponent initialMessages={[  { sender: "Alice", message: "Hello!" },
]}  userName={userInfo.username} room={"room"} />
      </div>
    </div>
  );
}

async function fetchInitialMessages() {
  // Replace this with your actual database fetching logic
  return [
    { sender: "Alice", message: "Hello!" },
    { sender: "Bob", message: "Hi there!" },
  ];
}

