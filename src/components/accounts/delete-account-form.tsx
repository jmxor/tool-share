"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteAccount } from "@/lib/auth/actions";
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DeleteAccountForm() {
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        try {
            const result = await deleteAccount();

            if (!result) {
                setError("An error occured. Please try again.");
            } else {
            }
        } catch {
            setError("Unexpected error occured. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
        >
            <h2 className="text-xl text-center text-red-500 font-bold">Dangerous!</h2>
            <label className="flex p-4 gap-4 items-start bg-orange-100 border-l-4 border-orange-500 text-orange-700 rounded-md">
                <Checkbox className="mt-1" checked={checked} onCheckedChange={() => { setChecked(!checked) }} />
                <p className="text-sm font-medium leading-5">
                    I acknowledge that by checking this box and pressing the button below, my account will be
                    <span className="font-bold"> permanently deleted</span> without any chance of recovery.
                </p>
            </label>
            <Button
                className="bg-red-500 text-white w-full hover:bg-red-600"
                type='submit'
                disabled={!checked || isLoading}
            >
                <Trash2 />
                <p>{isLoading ? "Deleting account .." : "Permanently Delete Account"}</p>
            </Button>
            {error && <p className="font-medium text-sm text-red-500">{error}</p>}
        </form>
    );
}
