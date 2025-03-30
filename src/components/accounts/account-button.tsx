"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, FileUser, ShieldAlert, AlertCircle } from 'lucide-react';
import { signOutUser, userIsAdmin } from "@/lib/auth/actions";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserWarnings from "./user-warnings";

export default function AccountButton({ email }: { email: string }) {
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
        const checkAdminStatus = async () => {
            const adminStatus = await userIsAdmin(email);
            setIsAdmin(adminStatus);
        };
        
        checkAdminStatus();
    }, [email]);
    
    async function handleLogOut() {
        await signOutUser();
    }

    return (
        <div className="flex items-center gap-2">
            <UserWarnings />
            <DropdownMenu>
                <DropdownMenuTrigger className="text-sm flex justify-center gap-2 p-2 rounded-md hover:bg-neutral-100">
                    <User />
                    <p className="hidden sm:inline">{email}</p>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <a href='/auth/account'>
                            <FileUser className="mr-2 h-4 w-4" />
                            Account Page
                        </a>
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                        <DropdownMenuItem asChild>
                            <Link href="/admin">
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Admin Dashboard
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                        <Link href="/reports">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            My Reports
                        </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleLogOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
