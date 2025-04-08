"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createConversation } from "@/lib/actions";

export default function SendMessageButton({
    email,
    first_username,
}: {
    email: string;
    first_username: string;
}) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = async () => {
    setIsNavigating(true);

    try {
        const conversationId = await createConversation(email, first_username);
        if (conversationId) {
            router.push(`/chat?first_username=${first_username}`);
        } else {
            console.error("[ERROR] Failed to create conversation.");
        }
    } catch (error) {
        console.error("[ERROR] Error creating conversation:", error);
    } finally {
        setIsNavigating(false);
    }
  };

    return (
        <Button
            onClick={handleClick}
            className="font-semibold bg-blue-500 items-center text-white px-4 py-1 shadow-md hover:cursor-pointer hover:bg-blue-600 flex gap-1"
            disabled={isNavigating} // Disable button while navigating
        >
            Message
            <MessageCircle className="w-4 h-4" />
        </Button>
  );
}
