'use client';

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socketClient";
import { getConversation, getMessagesByUserId, insertDirectMessage } from "@/lib/actions";
import ChatMessage from "@/components/ChatMessage";

interface ChatComponentProps {
  initialMessages: { sender: string; message: string }[];
  userName: string;
  conversationID: number;
  initialRecipient: string;
  allConversations: [];
  currentUserId: string;
}

function mapMessages(messages: any[]): { sender: string; recipient: number; message: string }[] {
  return messages.map((msg) => ({
    sender: msg.sender_username,
    recipient: msg.recipient_username,
    message: msg.message,
  }));
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  initialMessages,
  userName,
  conversationID,
  initialRecipient,
  allConversations,
  currentUserId,
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [recipient, setRecipient] = useState(initialRecipient); // State for recipient

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
      await insertDirectMessage(userName, recipient, message);
    }
  };

  const onSelectConversation = async (userId: string) => {
    let messagesInfo = await getMessagesByUserId(currentUserId, userId);
    if (!messagesInfo) {
      messagesInfo = [];
    }
    const formattedMessages = mapMessages(messagesInfo);
    setMessages(formattedMessages);
    setRecipient(userId)
  };

  return (
    <div className="flex"> 

    <div className="w-1/4 w-full max-w-xs bg-white border-r border-gray-200">
      <h2 className="text-lg font-semibold p-4">Conversations</h2>
      <ul className="divide-y divide-gray-200">
        {allConversations.map((conversation) => {
          const otherUserId =
            conversation.user1_id === currentUserId
              ? conversation.user2_id
              : conversation.user1_id;
  
          return (
            <li
              key={conversation.id}
              className="p-4 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectConversation(conversation.user1_id === currentUserId
                ? conversation.user2_id
                : conversation.user1_id)}
            >
              <span className="font-medium">User ID: {otherUserId}</span>
            </li>
          );
        })}
      </ul>
    </div>  
  
    <div className="w-3/4 w-full">
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
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none"
          placeholder='Type your message here... '
        />
        <Button
          type="submit"
          className='shadow-lg border-1 bg-black hover:bg-gradient-to-tr from-black to-gray-600 px-4 py-2 rounded-lg'
        >
          Send
        </Button>
      </form>
    </div>
  
  </div>
  


  );
};

export default ChatComponent;

