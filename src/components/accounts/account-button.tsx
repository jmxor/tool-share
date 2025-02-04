"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, FileUser } from 'lucide-react';
import { signOutUser } from "@/lib/auth/actions";
import Link from "next/link";

export default function AccountButton({ email }: { email: string }) {
    async function handleLogOut() {
        await signOutUser();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="text-sm flex justify-center gap-2 p-2 rounded-md hover:bg-neutral-100">
                <User />
                <p className="hidden lg:inline">{email}</p>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href='/auth/account'>
                        <FileUser />
                        Account Page
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogOut}><LogOut />Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
