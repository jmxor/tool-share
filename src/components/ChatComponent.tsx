'use client';

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { socket } from "@/lib/socketClient";
import ChatMessage from "@/components/ChatMessage";
import { useEffect, useState, useRef } from "react";
import { getMessagesByUserId, insertDirectMessage } from "@/lib/actions";
import { useRouter } from 'next/navigation';
import { getFirstUsernameID } from "@/lib/auth/actions";

interface ChatComponentProps {
  first_username: string,
  initialMessages: { sender: string; message: string }[];
  userName: string;
  initialConversationID: number;
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
  first_username,
  initialMessages,
  userName,
  initialConversationID,
  initialRecipient,
  allConversations,
  currentUserId,
}) => {
  console.log("GOT PARAMS:", first_username);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [recipient, setRecipient] = useState(initialRecipient);
  const [conversationID, setConversationId] = useState(initialConversationID);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    socket.on("message", (data) => {
      if (data.sender !== userName) {
        setMessages((prev) => [...prev, data]);
      }
    });
    
    return () => {
      socket.off("user_joined");
      socket.off("message");
    };
  }, [userName]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;
    
    const data = { room: conversationID, message, sender: userName };
    setMessages((prev) => [...prev, { sender: userName, message }]);
    socket.emit("message", data);
    await insertDirectMessage(userName, recipient, message);
    setMessage("");
  };
  
  const onSelectConversation = async (
    userId: string,
    recipient_username: string,
  ) => {
    let messagesInfo = await getMessagesByUserId(currentUserId, userId);
    let newConversationId = initialConversationID;
    
    if (messagesInfo && messagesInfo.length > 0) {
      newConversationId = messagesInfo[0].conversation_id;
    } else {
      messagesInfo = [];
    }
    setConversationId(newConversationId);
    const formattedMessages = mapMessages(messagesInfo);
    setMessages(formattedMessages);
    setRecipient(recipient_username);
    socket.emit("join-room", { room: newConversationId, username: userName });
    
    // Update the URL with the new conversation ID, navigating to /chat
    router.push(`/chat?conversationId=${newConversationId}`);
  };
  

  useEffect(() => {
    const changeTheFocusedChat = async () => {
      console.log(first_username)
      if (first_username) {
        console.log("GONNA AWAIT:");
        const otherUserID = await getFirstUsernameID(first_username)
        onSelectConversation(otherUserID, first_username);
      }
    }
    changeTheFocusedChat();
  }, [])

  return (
    <div className="grid grid-cols-4">
      <div className="col-start-1 col-end-2 ml-4 bg-white border-r border-gray-200">
        <h2 className="text-lg font-semibold p-4">Conversations</h2>
        <ul className="divide-y divide-gray-200">
          {allConversations.length > 0 ? (
            allConversations.map((conversation) => {
              const otherUserId = conversation.recipient_user_id;
              const otherUsername = conversation.recipient_username;
              return (
                <li
                  key={conversation.id}
                  className="p-4 bg-gradient-to-l from-white to-gray-100-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() =>
                    onSelectConversation(otherUserId, otherUsername)
                  }
                >
                  <span className="font-medium">{otherUsername}</span>
                </li>
              );
            })
          ) : (
            <span>No conversations</span>
          )}
        </ul>
      </div>

      {allConversations.length > 0 ? (
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
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none"
              placeholder="Type your message here... "
            />
            <Button
              type="submit"
              className="shadow-lg border-1 bg-black hover:bg-gradient-to-tr from-black to-gray-600 px-4 py-2 rounded-lg"
            >
              Send
            </Button>
          </form>
        </div>
      ) : (
        <span>No conversations</span>
      )}
    </div>
  );
};

export default ChatComponent;
