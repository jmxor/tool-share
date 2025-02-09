"use client";

import { ReviewFormState, submitReview } from "@/lib/auth/actions";
import { useActionState, useState } from "react";
import Stars from "@/components/accounts/stars";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export default function ReviewFormPage() {

    const initialState: ReviewFormState = {
        message: null,
        errors: {}
    }

    const [state, formAction, isPending] = useActionState(
        submitReview,
        initialState
    )

    const [stars, setStars] = useState(0);

    const handleStarChange = (value: number) => {
        setStars(value);
    };

    return (
        <form
            action={formAction}
            className="h-32 min-w-48 w-1/5 flex flex-col gap-2"
        >
            <h2>Leave your review</h2>
            <Stars name="stars" onChange={handleStarChange} />
            <Textarea placeholder="Write your review here." />
            <Button type="submit" className="w-full">
                Submit Review
            </Button>
        </form>
    )
}
