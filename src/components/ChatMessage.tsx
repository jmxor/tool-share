import React from 'react';
import { formatDistanceToNow } from 'date-fns'; 

interface ChatMessageProps {
  sender: string;
  message: string;
  isOwnMessage: boolean;
  timestamp?: Date; 
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  message,
  isOwnMessage,
  timestamp, 
}) => {
  // Format the timestamp only if it exists
  const timeAgo = timestamp
    ? formatDistanceToNow(timestamp, { addSuffix: true })
    : ''; // Show nothing if no timestamp

  return (
    // Added mb-2 for spacing between messages
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}> 
      <div
        className={`max-w-[70%] p-3 rounded-lg shadow-md ${ // Added shadow
          isOwnMessage
                ? "bg-gradient-to-t from-purple-500 to-blue-500 text-white border-2 rounded-br-none"
                : "bg-white border-2 text-black rounded-bl-none"
        }`}
      >
       {!isOwnMessage && <div className="font-semibold mb-1 text-sm">{sender}</div>}
        <div className="text-sm">{message}</div>
        {/* Display the formatted time */}
        {timeAgo && ( // Only render div if timeAgo exists
          <div
            className={`text-xs mt-1 text-right ${ // Align time to right
              isOwnMessage ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {timeAgo}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
