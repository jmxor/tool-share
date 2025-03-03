"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { deleteReview, DeleteReviewState } from "@/lib/auth/actions";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

export default function DeleteReviewButton({
    first_username,
}: {
    first_username: string;
}) {
    const [submitState, setSubmitState] = useState<DeleteReviewState>({
        message: "",
        success: null,
    });
    const [open, setOpen] = useState(false);

    async function handleSubmit() {
        const newState = await deleteReview(first_username);
        setSubmitState(newState);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mt-2 text-xs bg-red-500 shadow-md font-semibold text-white hover:bg-red-600 rounded-none">
                    Delete Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Review?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this review? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={handleSubmit}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
            {submitState.success === false ? <p>{submitState.message}</p> : ""}
        </Dialog>
    );
}
