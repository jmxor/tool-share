"use client";

// ChatComponent.tsx
import { useEffect, useState } from "react";
import ChatMessage from "@/components/ChatMessage";
import { socket } from "@/lib/socketClient";
import { insertDirectMessage } from "@/lib/actions";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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

  const [message, setMessage] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "") {
      const data = { conversationID, message, sender: userName };
      setMessages((prev) => [...prev, { sender: userName, message }]);
      socket.emit("message", data);
      setMessage("");
      await insertDirectMessage("38", "33", message);
    };
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <title>Chat page</title>
      <h1>userName: {userName}</h1>
      <div className="flex-col-reverse justify-end h-[700px] overflow-y-auto p-4 mt-4 mb-4 bg-gradient-to-t from-white to-gray-100 border-2 rounded-lg">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            sender={msg.sender}
            message={msg.message}
            isOwnMessage={msg.sender === userName}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className='flex gap-2 mt-4'>
        <Input type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none"
          placeholder='Type your message here... '>
        </Input>
        <Button type="submit" className='shadow-lg border-1 bg-black hover:bg-gradient-to-tr from-black to-gray-600 px-4 py-2 rounded-lg'>Send</Button>
      </form>
    </div>
  );
};

export default ChatComponent;