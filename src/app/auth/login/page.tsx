"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActionState } from "react";
import { signInUser } from "@/lib/auth/actions";


export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(
        handleLogIn,
        undefined
    )

    async function handleLogIn(prevState: string | undefined, formData: FormData) {
        const result = await signInUser(formData);
        return result;
    }

    return (
        <div className="flex min-h-screen w-full justify-center bg-gray-50">
            <form 
                action={formAction}
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
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
                { state && state !== "Success" ? <p className="text-red-400 flex justify-center text-sm">Invalid credentials.</p> : ""}
            </form>
        </div>
    );
}