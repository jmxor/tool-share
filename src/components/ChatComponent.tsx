"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { socket } from "@/lib/socketClient";
import ChatMessage from "@/components/ChatMessage";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  deleteConversationAction,
  getMessagesByUserId,
  insertDirectMessage,
  checkIfConversationExists,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
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
  first_username: string;
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
    initialMessages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
    }))
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
    socket.on(
      "message",
      (data: {
        sender: string;
        message: string;
        timestamp?: Date | string;
      }) => {
        if (data.sender !== userName) {
          // Ensure timestamp is a Date object
          const newMessage: DisplayMessage = {
            ...data,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(), // Fallback to now if missing
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    );

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
    const data = {
      room: conversationID,
      message,
      sender: userName,
      timestamp: timestamp.toISOString(),
    };
    socket.emit("message", data);

    await insertDirectMessage(userName, recipient, message, timestamp);

    setMessage("");
  };

  const onSelectConversation = useCallback(
    async (userId: string, recipient_username: string) => {
      const conversationExists = await checkIfConversationExists(
        userId,
        currentUserId
      );
      // Assume getMessagesByUserId now returns messages with timestamps
      const messagesInfo = await getMessagesByUserId(currentUserId, userId);
      let newConversationId = initialConversationID;

      if (conversationExists) {
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
    },
    [userName, currentUserId, initialConversationID, router]
  );

  const deleteConversation = async () => {
    if (!conversationID) return;
    const result = await deleteConversationAction(conversationID);
    if (result == -1) {
      console.log("Failed");
      return;
    }
    router.push(`/chat`);
  };

  useEffect(() => {
    const changeTheFocusedChat = async () => {
      if (first_username) {
        // Check if the initial load already set the correct recipient/messages
        // to avoid unnecessary re-fetch and state update if possible.
        if (first_username !== recipient) {
          const otherUserID = await getFirstUsernameID(first_username);
          if (otherUserID) {
            // Ensure otherUserID is found
            await onSelectConversation(otherUserID, first_username);
          } else {
            console.error("Could not find user ID for:", first_username);
          }
        }
      }
    };
    // Only run if first_username is provided and different from current recipient
    if (first_username && first_username !== recipient) {
      changeTheFocusedChat();
    }
  }, [first_username, recipient, onSelectConversation]); // Dependency array includes first_username

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-4">
      {/* Mobile toggle button */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 md:hidden">
        <h2 className="flex items-center text-lg font-semibold">
          <User className="mr-2 h-4 w-4" /> {recipient || "Select Conversation"}
        </h2>
        <Button
          onClick={() => setShowConversations(!showConversations)}
          className="px-3 py-1"
        >
          {showConversations ? "Hide Contacts" : "Show Contacts"}
        </Button>
      </div>

      {/* Conversations sidebar */}
      <div
        className={`${showConversations ? "block" : "hidden"} absolute z-10 h-[calc(100vh-8rem)] w-full overflow-y-auto border-r border-gray-200 bg-white md:relative md:col-start-1 md:col-end-2 md:block md:h-auto md:w-auto`}
      >
        <h2 className="hidden p-4 text-lg font-semibold md:block">
          Conversations
        </h2>
        <ul className="divide-y divide-gray-200">
          {allConversations.length > 0 ? (
            allConversations.map((conversation) => {
              const otherUserId = conversation.recipient_user_id;
              const otherUsername = conversation.recipient_username;
              const isSelected = otherUsername === recipient;
              return (
                <li
                  key={conversation.id}
                  className={`cursor-pointer p-4 hover:bg-gray-200 ${isSelected ? "border-l-4 border-blue-500 bg-gray-200" : "to-gray-100-100 bg-gradient-to-l from-white"}`}
                  onClick={() =>
                    onSelectConversation(otherUserId, otherUsername)
                  }
                >
                  <span className="font-medium">{otherUsername}</span>
                </li>
              );
            })
          ) : (
            <span className="block p-4">No conversations</span>
          )}
        </ul>

        {/* Delete conversation button */}
        {conversationID > 0 && recipient && (
          <div className="border-t border-gray-200 p-4">
            <Button
              onClick={deleteConversation}
              className="w-full bg-red-500 text-white hover:bg-red-600"
              variant="destructive"
            >
              <Trash className="mr-2 h-4 w-4" /> Delete Conversation
            </Button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      {/* Conditionally render based on whether a recipient is selected */}
      {recipient ? (
        <div className="p-4 md:col-start-2 md:col-end-5">
          <div className="mb-4 flex h-[calc(100vh-16rem)] flex-col overflow-y-auto rounded-lg border-2 bg-gradient-to-t from-white to-gray-100 p-4 md:h-[calc(100vh-10rem)]">
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
              className="flex-1 rounded-lg border-2 px-4 py-2 focus:outline-none"
              placeholder="Type your message here... "
              disabled={!recipient}
            />
            <Button
              type="submit"
              className="border-1 rounded-lg bg-black from-black to-gray-600 px-4 py-2 shadow-lg hover:bg-gradient-to-tr"
              disabled={!recipient || message.trim() === ""}
            >
              Send
            </Button>
          </form>
        </div>
      ) : (
        // Show placeholder if no conversation is selected
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center p-4 md:col-start-2 md:col-end-5">
          <div className="text-center text-gray-500">
            {allConversations.length > 0
              ? "Select a conversation to start chatting."
              : "No conversations yet."}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
