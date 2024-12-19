"use client";

import { User } from "@/lib/types";
import { Input } from "../ui/input";
import { FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { updateUsername } from "@/lib/auth/actions";

export default function AccountInfo({ userInfo }: { userInfo: User}) {
    const [inputValue, setInputValue] = useState(userInfo.username);
    const [error, setError] = useState("")

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if ( userInfo.username !== inputValue) {
            const result = await updateUsername(userInfo, inputValue);
            // Roll back if failed
            if (!result) {  
                setError("Failed");
                setInputValue(userInfo.username);
            } else {
                setInputValue(inputValue);
                setError("Success");
            }
        }
    }
    
    return (
        <form 
            className="bg-white p-6 flex flex-col gap-8"
            onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold">Account Information</h2>
            <div className="flex flex-col gap-2">
                <p className="py-1"><strong>Email:</strong> {userInfo.email}</p>
                <div className="flex flex-col items-start">
                    <p className="flex items-center w-fit gap-2">
                        <strong>Username:</strong>
                        <Input
                            name="username"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </p>
                    {error == "Failed" ? (
                        <p className="text-red-400 text-center mt-2">
                            That username is unavailable. Try a different one.
                        </p>
                    ) : error == "Success" ? (
                        <p className="text-green-400 text-center mt-2">
                            Successfully saved username.
                        </p> 
                    ) : ""}
                </div>
                <p className="py-1"><strong>Join Date:</strong> {userInfo.created_at.toLocaleDateString()}</p>
                <p className="py-1"><strong>Role:</strong> {userInfo.user_privilege}</p>
            </div>
            <Button type="submit" className="">Save Changes</Button>
        </form>
    );
}