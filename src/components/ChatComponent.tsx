'use client';

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { socket } from "@/lib/socketClient";
import ChatMessage from "@/components/ChatMessage"; 
import { useEffect, useState, useRef } from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { deleteConversationAction, getMessagesByUserId, insertDirectMessage, checkIfConversationExists } from "@/lib/actions";
import { useRouter } from 'next/navigation';
import { getFirstUsernameID } from "@/lib/auth/actions";
import { Trash, User } from "lucide-react";

// --- Interfaces and mapMessages function  ---
interface Message {
  sent_at: Date;
  sender_username: string;
  message: string;
  conversation_id?: number;
  timestamp?: Date | string; // Allow string initially if coming from DB/API
}

interface Conversation {
  id: number;
  recipient_user_id: string;
  recipient_username: string;
}

interface DisplayMessage {
  sender: string;
  message: string;
  timestamp?: Date; 
}
interface ChatComponentProps {
  first_username: string,
  initialMessages: DisplayMessage[]; 
  userName: string;
  initialConversationID: number;
  initialRecipient: string;
  allConversations: Conversation[];
  currentUserId: string;
}

function mapMessages(messages: Message[]): DisplayMessage[] {
  return messages.map((msg) => ({
    sender: msg.sender_username,
    message: msg.message,
    timestamp: msg.sent_at ? new Date(msg.sent_at) : undefined, 
  }));
}
// --- End of Interfaces and mapMessages ---

const ChatComponent: React.FC<ChatComponentProps> = ({
  first_username,
  initialMessages,
  userName,
  initialConversationID,
  initialRecipient,
  allConversations,
  currentUserId,
}) => {
  const [message, setMessage] = useState("");
  // Ensure initialMessages timestamps are Date objects if needed
  const [messages, setMessages] = useState<DisplayMessage[]>(() => 
    initialMessages.map(msg => ({ ...msg, timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined }))
  );
  const [recipient, setRecipient] = useState(initialRecipient);
  const [conversationID, setConversationId] = useState(initialConversationID);
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    socket.on("message", (data: { sender: string; message: string; timestamp?: Date | string }) => {
      if (data.sender !== userName) {
        // Ensure timestamp is a Date object
        const newMessage: DisplayMessage = {
          ...data,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date() // Fallback to now if missing
        };
        setMessages((prev) => [...prev, newMessage]);
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
    
    const timestamp = new Date(); // Generate timestamp now
    const newMessage: DisplayMessage = { sender: userName, message, timestamp };
    
    //update UI
    setMessages((prev) => [...prev, newMessage]); 
    
    // Prepare data for socket and backend
    // Send timestamp as ISO string for better serialization
    const data = { room: conversationID, message, sender: userName, timestamp: timestamp.toISOString() }; 
    socket.emit("message", data);
    
    await insertDirectMessage(userName, recipient, message, timestamp); 
    
    setMessage("");
  };
  
  const onSelectConversation = useCallback(async (
    userId: string,
    recipient_username: string,
  ) => {

    const conversationExists = await checkIfConversationExists(userId, currentUserId);
    // Assume getMessagesByUserId now returns messages with timestamps
    const messagesInfo = await getMessagesByUserId(currentUserId, userId); 
    let newConversationId = initialConversationID;

    if(conversationExists){
      newConversationId = conversationExists;
    }


    // Use mapMessages which handles timestamp conversion
    const formattedMessages = messagesInfo ? mapMessages(messagesInfo) : []; 
    
    setConversationId(newConversationId);
    setMessages(formattedMessages);
    setRecipient(recipient_username);
    socket.emit("join-room", { room: newConversationId, username: userName });
    setShowConversations(false); 
    router.push(`/chat?conversationId=${newConversationId}`);
  }, [userName, currentUserId, initialConversationID, router]);
  
  const deleteConversation = async () => {
    if (!conversationID) return;
    const result = await deleteConversationAction(conversationID);
    if (result == -1){
      console.log("Failed")
      return;
    };
    router.push(`/chat`);
  };

  useEffect(() => {
    const changeTheFocusedChat = async () => {
      if (first_username) {
        // Check if the initial load already set the correct recipient/messages
        // to avoid unnecessary re-fetch and state update if possible.
        if (first_username !== recipient) { 
          const otherUserID = await getFirstUsernameID(first_username);
          if (otherUserID) { // Ensure otherUserID is found
             await onSelectConversation(otherUserID, first_username);
          } else {
            console.error("Could not find user ID for:", first_username);
          }
        }
      }
    }
    // Only run if first_username is provided and different from current recipient
    if (first_username && first_username !== recipient) {
       changeTheFocusedChat();
    }

  }, [first_username, recipient, onSelectConversation]); // Dependency array includes first_username

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 relative">
      {/* Mobile toggle button */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center"><User className="w-4 h-4 mr-2" /> {recipient || 'Select Conversation'}</h2>
        <Button 
          onClick={() => setShowConversations(!showConversations)}
          className="px-3 py-1"
        >
          {showConversations ? 'Hide Contacts' : 'Show Contacts'}
        </Button>
      </div>

      {/* Conversations sidebar */}
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

      {/* Chat Area */}
      {/* Conditionally render based on whether a recipient is selected */}
      {recipient ? ( 
        <div className="md:col-start-2 md:col-end-5 p-4">
          <div className="flex flex-col h-[calc(100vh-16rem)] md:h-[calc(100vh-10rem)] overflow-y-auto p-4 mb-4 bg-gradient-to-t from-white to-gray-100 border-2 rounded-lg">
            {/* Map messages in normal order (oldest first) */}
            {messages.map((msg, index) => (
              <ChatMessage
                key={`${msg.sender}-${index}-${msg.timestamp?.getTime()}`} 
                sender={msg.sender}
                message={msg.message}
                isOwnMessage={msg.sender === userName}
                timestamp={msg.timestamp}
              />
            ))}
            {/* Scroll anchor at the bottom */}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none"
              placeholder="Type your message here... "
              disabled={!recipient}
            />
            <Button
              type="submit"
              className="shadow-lg border-1 bg-black hover:bg-gradient-to-tr from-black to-gray-600 px-4 py-2 rounded-lg"
              disabled={!recipient || message.trim() === ""}
            >
              Send
            </Button>
          </form>
        </div>
      ) : (
        // Show placeholder if no conversation is selected
        <div className="md:col-start-2 md:col-end-5 p-4 flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-center text-gray-500">
            {allConversations.length > 0 ? "Select a conversation to start chatting." : "No conversations yet."}
          </div>
        </div>
      )} 
    </div>
  );
};

export default ChatComponent;
