
import React from 'react'

interface ChatMessageProps {
    sender: string;
    message: string;
    isOwnMessage: boolean;
}

// Chat message function
const ChatMessage = ({ sender, message, isOwnMessage}: ChatMessageProps) => {


    // Return a message that is blue and on the right hand side
    // on reciever screen, gray and on the left hand side if it is from the sender
    return (
        
        <div className={`flex ${
            isOwnMessage 
            ? "justify-end" 
            : "justify-start"
            } mb-3`}
            >
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
                 isOwnMessage
                ? "bg-gradient-to-t from-purple-500 to-blue-500 text-white border-2"
                : "bg-white border-2 text-black"
            }`}>
                { <p className={`text-sm font-bold ${ isOwnMessage ? "text-white" : "text-black" }`}>{ sender }</p> }
                <p className=''>{message}</p>
            </div>
        </div>
    )
};

export default ChatMessage;