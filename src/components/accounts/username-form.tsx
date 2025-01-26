"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { FormEvent, useState } from "react";
import { updateUsername } from "@/lib/auth/actions";

export default function UsernameForm({ userInfo }: { userInfo: User }) {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("")

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (userInfo.username !== inputValue) {
            const result = await updateUsername(inputValue);
            if (!result) {
                setError("Failed");
                setInputValue("");
            } else {
                window.location.reload();
            }
        }
    }

    return (
        <form
            className="bg-gray-100 p-4 rounded-lg"
            onSubmit={handleSubmit}
        >
            <h2 className="font-medium text-lg mb-2">Change Username</h2>
            <div className="flex flex-col">
                <span className="flex gap-2">
                    <Input
                        name="username"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        type="text"
                        placeholder="New Username"
                        className="w-full bg-white" />
                    <Button type="submit" className="w-fit" disabled={inputValue == userInfo.username}>Update</Button>
                </span>
                {error == "Failed" ? (
                    <p className="text-red-400 text-center mt-2">
                        That username is unavailable. Try a different one.
                    </p>
                ) : error == "Success" ? (
                    <p className="text-green-400 font-medium text-center mt-2">
                        Username updated!
                    </p>
                ) : ""}
            </div>
        </form>
    )
}
