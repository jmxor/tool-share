"use client";

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ChatForm = ({ onSendMessage } : { onSendMessage: (message: string) => void; }) => {
    const [message, setMessage] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(message.trim() !== ""){
            onSendMessage(message);
            setMessage("");
        };
    };

    return (
        <form onSubmit={handleSubmit} className='flex gap-2 mt-4'>
            <Input type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none" 
                placeholder='Type your message here... '>  
            </Input>
            <Button type="submit" className='shadow-lg border-1 bg-black hover:bg-gradient-to-tr from-black to-gray-600 px-4 py-2 rounded-lg'>Send</Button>
        </form>
    );
};

export default ChatForm;