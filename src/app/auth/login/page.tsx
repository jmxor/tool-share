import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full justify-center bg-gray-50">
            <form className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md h-fit mt-20">
                <h2 className="text-center text-3xl font-bold text-gray-800">Log In</h2>
                <p className="text-center text-sm text-gray-500">
                    Welcome back! Please log in to your account.
                </p>
                <div className="space-y-4">
                    <Input type="email" placeholder="Enter your email" className="w-full" />
                    <Input type="password" placeholder="Enter your password" className="w-full" />
                </div>
                <Button type="submit" className="w-full">Log In</Button>
                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}