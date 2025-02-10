"use client";

import { ReviewFormState, submitReview } from "@/lib/auth/actions";
import { useActionState, useState } from "react";
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

    const [stars, setStars] = useState(0);

    const handleStarChange = (value: number) => {
        setStars(value);
    };

    return (
        <form
            action={formAction}
            className="max-h-1/3 h-fit min-w-48 md:w-1/5 flex flex-col gap-2 items-center p-2 mr-2"
        >
            <h2>Leave your feedback</h2>
            <input type="hidden" name="target" value={first_username} />
            <Stars name="stars" action={handleStarChange} />
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
