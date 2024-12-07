"use client";

import { User } from "@/lib/types";
import { Input } from "./ui/input";
import { FormEvent, useState } from "react";
import { Button } from "./ui/button";

export default function AccountInfo({ userInfo }: { userInfo: User}) {
    const [username, setUsername] = useState(userInfo.username);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget; 
    }
    
    return (
        <form 
            className="bg-white p-6 flex flex-col gap-8"
            onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold">Account Information</h2>
            <div className="flex flex-col gap-2">
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p className="flex items-center w-fit gap-2">
                    <strong>Username:</strong>
                    <Input 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                    >
                    </Input>
                </p>
                <p><strong>Join Date:</strong> {userInfo.created_at.toLocaleDateString()}</p>
                <p><strong>Role:</strong> {userInfo.user_privilege}</p>
            </div>
            <Button className="">Save Changes</Button>
        </form>
    );
}