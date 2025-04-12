'use client';

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { socket } from "@/lib/socketClient";
import ChatMessage from "@/components/ChatMessage";
import { useEffect, useState, useRef } from "react";
import { deleteConversation, deleteConversationAction, getMessagesByUserId, insertDirectMessage } from "@/lib/actions";
import { useRouter } from 'next/navigation';
import { getFirstUsernameID } from "@/lib/auth/actions";
import { Trash, User } from "lucide-react";

// Define types for messages and conversations
interface Message {
  sender_username: string;
  message: string;
  conversation_id?: number;
}

interface Conversation {
  id: number;
  recipient_user_id: string;
  recipient_username: string;
}

interface ChatComponentProps {
  first_username: string,
  initialMessages: { sender: string; message: string }[];
  userName: string;
  initialConversationID: number;
  initialRecipient: string;
  allConversations: Conversation[];
  currentUserId: string;
}

function mapMessages(messages: Message[]): { sender: string; message: string }[] {
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
  const [showConversations, setShowConversations] = useState(false);
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
    setShowConversations(false); // Hide conversations list on mobile after selection

    // Update the URL with the new conversation ID, navigating to /chat
    router.push(`/chat?conversationId=${newConversationId}`);
  };
  
  const deleteConversation = async () => {
    if (!conversationID) return;
    const result = await deleteConversationAction(conversationID);
    if (result == -1){
      console.log("Failed")
      return;
    };
    console.log("success");
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
    <div className="grid grid-cols-1 md:grid-cols-4 relative">
      {/* Mobile toggle button */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center"><User className="w-4 h-4 mr-2" /> {recipient}</h2>
        <Button 
          onClick={() => setShowConversations(!showConversations)}
          className="px-3 py-1"
        >
          {showConversations ? 'Hide Contacts' : 'Show Contacts'}
        </Button>
      </div>

      {/* Conversations sidebar - hidden on mobile unless toggled */}
      <div className={`${showConversations ? 'block' : 'hidden'} md:block md:col-start-1 md:col-end-2 bg-white border-r border-gray-200 h-[calc(100vh-8rem)] md:h-auto overflow-y-auto absolute md:relative z-10 w-full md:w-auto`}>
        <h2 className="text-lg font-semibold p-4 hidden md:block">Conversations</h2>
        <ul className="divide-y divide-gray-200">
          {allConversations.length > 0 ? (
            allConversations.map((conversation) => {
              const otherUserId = conversation.recipient_user_id;
              const otherUsername = conversation.recipient_username;
              const isSelected = otherUsername === recipient;
              return (
                <li
                  key={conversation.id}
                  className={`p-4 hover:bg-gray-200 cursor-pointer ${isSelected ? 'bg-gray-200 border-l-4 border-blue-500' : 'bg-gradient-to-l from-white to-gray-100-100'}`}
                  onClick={() =>
                    onSelectConversation(otherUserId, otherUsername)
                  }
                >
                  <span className="font-medium">{otherUsername}</span>
                </li>
              );
            })
          ) : (
            <span className="p-4 block">No conversations</span>
          )}
        </ul>
        
        {/* Delete conversation button */}
        {conversationID > 0 && recipient && (
          <div className="p-4 border-t border-gray-200">
            <Button 
              onClick={deleteConversation}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              variant="destructive"
            >
              <Trash className="w-4 h-4 mr-2" /> Delete Conversation
            </Button>
          </div>
        )}
      </div>

      {allConversations.length > 0 ? (
        <div className="md:col-start-2 md:col-end-5 p-4">
          <div className="flex-col-reverse justify-end h-[50vh] md:h-[750px] overflow-y-auto p-4 mt-4 mb-4 bg-gradient-to-t from-white to-gray-100 border-2 rounded-lg">
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
        <div className="col-span-full p-4 text-center">No conversations</div>
      )}
    </div>
  );
};

export default ChatComponent;
