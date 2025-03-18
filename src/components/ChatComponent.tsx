'use client';

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socketClient";
import { getMessagesByUserId, insertDirectMessage } from "@/lib/actions";
import ChatMessage from "@/components/ChatMessage";

interface ChatComponentProps {
  initialMessages: { sender: string; message: string }[];
  userName: string;
  conversationID: number;
  initialRecipient: string;
  allConversations: any[];
  currentUserId: string;
}

function mapMessages(messages: any[]): { sender: string; message: string }[] {
  return messages.map((msg) => ({
    sender: msg.sender_username,
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
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [recipient, setRecipient] = useState(initialRecipient); // State for recipient
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on("message", (data) => {
      // Only add the message to the state if it's NOT from the current user
      if (data.sender !== userName) {
        setMessages((prev) => [...prev, data]);
      }
    });
  
    return () => {
      socket.off("user_joined");
      socket.off("message");
    };
  }, [userName]); // Add userName as a dependency to useEffect
  

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission
    if (message.trim() === "") return; // Don't send empty messages

    const data = { room: conversationID, message, sender: userName };
    setMessages((prev) => [...prev, { sender: userName, message }]);
    socket.emit("message", data);
    await insertDirectMessage(userName, recipient, message);
    setMessage(""); // Clear the input field after sending
  };

  const onSelectConversation = async (
    userId: string,
    recipient_username: string,
  ) => {
    socket.emit("join-room", { room: conversationID, username: userName });
    let messagesInfo = await getMessagesByUserId(currentUserId, userId);
    if (!messagesInfo) {
      messagesInfo = [];
    }
    const formattedMessages = mapMessages(messagesInfo);
    setMessages(formattedMessages);
    setRecipient(recipient_username);
  };

  return (
    <div className="grid grid-cols-4"> 

      <div className="col-start-1 col-end-2 ml-4 bg-white border-r border-gray-200">
        <h2 className="text-lg font-semibold p-4">Conversations</h2>
        <ul className="divide-y divide-gray-200">

          {allConversations.map((conversation) => {
            const otherUserId = conversation.recipient_user_id
            const otherUsername = conversation.recipient_username
            return (
              <li
                key={conversation.id}
                className="p-4 bg-gradient-to-l from-white to-gray-100-100 hover:bg-gray-200 cursor-pointer"
                onClick={() => onSelectConversation(otherUserId, otherUsername)}
              >
                <span className="font-medium">{otherUsername}</span>
              </li>
            );
          })}

        </ul>
      </div>  
    
      <div className="col-start-2 col-end-5 mr-4">
        <div className="flex-col-reverse justify-end h-[750px] overflow-y-auto p-4 mt-4 mb-4 bg-gradient-to-t from-white to-gray-100 border-2 rounded-lg">
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
