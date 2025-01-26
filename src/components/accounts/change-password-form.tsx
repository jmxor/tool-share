"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { setPassword } from "@/lib/auth/actions";

export default function ChangePasswordForm() {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;

        const formData = new FormData(formElement);
        const newPassword = formData.get("new-password") as string;
        const confirmPassword = formData.get("confirm-password") as string;

        if (!newPassword || !confirmPassword) {
            setError("You need to fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await setPassword(newPassword);

            if (!result) {
                setError("Failed to change password. Please try again.");
            } else {
                setMessage("Password changed.");
            }

        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-medium text-lg mb-2">Change Password</h2>
            <div className="flex flex-col gap-2">
                <Input
                    name="new-password"
                    type="password"
                    placeholder="New Password"
                    className="w-full bg-white"
                    required
                />
                <Input
                    name="confirm-password"
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full bg-white"
                    required
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Confirm Change"}
                </Button>
            </div>
            {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
            {message && <p className="text-sm mt-2 text-center">{message}</p>}
        </form>
    );
}
