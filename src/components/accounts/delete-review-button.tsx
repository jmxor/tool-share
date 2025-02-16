"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { deleteReview, DeleteReviewState } from "@/lib/auth/actions";
import { redirect } from "next/dist/server/api-utils";

export default function DeleteReviewButton({ first_username }: { first_username: string }) {
    const [submitState, setSubmitState]: DeleteReviewState = useState<DeleteReviewState>({
        message: "",
        success: null
    });

    async function handleSubmit() {
        const newState = await deleteReview(first_username);
        setSubmitState(newState);
    }

    return (
        <>
            <Button
                onClick={() => handleSubmit()}
                className="mt-2 text-xs bg-red-500 shadow-md font-semibold text-white hover:bg-red-600 rounded-none">
                Delete Review
            </Button>
            {submitState.success === false ? <p>{submitState.message}</p> : ""}
        </>
    );
}
