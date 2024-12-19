"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    return (
        <form 
            className="bg-white p-6 flex flex-col gap-8"
        >
            <h2 className="text-2xl font-bold">
                Change Password
            </h2>
            <div className="flex flex-col gap-2 items-center">
                <Input 
                    type="password" 
                    placeholder="Enter your current password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input 
                    type="password" 
                    placeholder="Enter your new password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input 
                    type="password" 
                    placeholder="Confirm your new password" 
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
            </div>
            <Button type="submit" className="">Change Password</Button>
        </form>
    );
}