"use client";

// ChatComponent.tsx
import { useEffect, useState } from "react";
import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";
import { socket } from "@/lib/socketClient";
import { insertDirectMessage } from "@/lib/actions";

interface ChatComponentProps {
  initialMessages: { sender: string; message: string }[];
  userName: string;
  conversationID: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  initialMessages,
  userName,
  conversationID,
}) => {
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("user_joined");
      socket.off("message");
    };
  }, []);

  const handleSendMessage = async (message: string) => {
    const data = { conversationID, message, sender: userName };
    setMessages((prev) => [...prev, { sender: userName, message }]);
    socket.emit("message", data);
    await insertDirectMessage("33", "38", message);
  };

  return (
    
    <div className="w-full max-w-3xl mx-auto">
    <title>Chat page</title> 
    <h1>userName: {userName}</h1>
    <div className="flex-col-reverse justify-end h-[700px] overflow-y-auto p-4 mt-4 mb-4 bg-gradient-to-t from-white to-gray-100 border-2 rounded-lg">
      {messages.map((msg, index) => (
        <ChatMessage 
        key={ index } 
        sender={ msg.sender } 
        message={ msg.message }
        isOwnMessage={ msg.sender === userName }
        />
      ))}
    </div>
    <ChatForm onSendMessage={handleSendMessage}/>
    </div>
  );
};

export default ChatComponent;