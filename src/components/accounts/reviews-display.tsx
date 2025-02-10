import { getReviews, Review } from "@/lib/auth/actions";

export default async function ReviewsDisplay({ first_username }: { first_username: string }) {
    const reviews: Review[] | null = await getReviews(first_username);
    console.log(reviews);
    return (
        <div>
        </div>
    );
}
