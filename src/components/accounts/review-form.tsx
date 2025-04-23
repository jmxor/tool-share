"use client";

import { ReviewFormState, submitReview } from "@/lib/auth/actions";
import { useActionState } from "react";
import Stars from "@/components/accounts/stars";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export default function ReviewFormPage({ first_username }: { first_username: string }) {

    const initialState: ReviewFormState = {
        message: null,
        errors: {}
    }

    const [state, formAction, isPending] = useActionState(
        submitReview,
        initialState
    );

    const handleStarChange = (value: number) => {
        return value;
    };

    return (
        <form
            action={formAction}
            className="min-w-48 flex flex-col gap-2 items-center p-2 mr-2"
        >
            <input type="hidden" name="target" value={first_username} />
            <div className="w-full"><Stars name="stars" action={handleStarChange} /></div>
            <p className="text-red-400 text-sm">{state.errors?.stars}</p>
            <Textarea name="text" placeholder="Write your review here." />
            <p className="text-red-400 text-sm">{state.errors?.text}</p>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Submitting ..." : "Submit Review"}
            </Button>
            {state.success === false ? <p className="text-red-400 flex justify-center text-sm">{state.message}</p> : ""}
        </form>
    )
}
