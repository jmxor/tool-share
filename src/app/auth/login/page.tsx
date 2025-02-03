"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { signInUser } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleLogIn(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;
        try {
            const formData = new FormData(formElement);
            const result = await signInUser(formData);

            if (!!result.error) {
                setError("Invalid credentials.");
            } else {
                router.push('/');
            }
        } catch {
            setError("Invalid credentials.");
        }
    }

    return (
        <div className="flex min-h-screen w-full justify-center bg-gray-50">
            <form
                onSubmit={handleLogIn}
                className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md h-fit mt-20"
            >
                <h2 className="text-center text-3xl font-bold text-gray-800">Log In</h2>
                <p className="text-center text-sm text-gray-500">
                    Welcome back! Please log in to your account.
                </p>
                <div className="space-y-4">
                    <Input name="email" type="email" placeholder="Enter your email" className="w-full" />
                    <Input name="password" type="password" placeholder="Enter your password" className="w-full" />
                </div>
                <Button type="submit" className="w-full">Log In</Button>
                <p className="text-center text-sm text-gray-500">
                    Don&apos t have an account?{' '}
                    <Link href="/auth/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
                {error ? <p className="text-red-400 flex justify-center text-sm">{error}</p> : ""}
            </form>
        </div>
    );
}
