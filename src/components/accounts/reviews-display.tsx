import { getReviews, Review } from "@/lib/auth/actions";

export default async function ReviewsDisplay({ first_username }: { first_username: string }) {
    const reviews: Review[] | null = await getReviews(first_username);

    if (!reviews || reviews.length <= 0) {
        return <div>This user has no reviews.</div>
    }
    return (
        <div className="flex flex-col md:flex-row gap-2 max-w-[60rem] overflow-x-auto h-1/3 flex-grow">
            {reviews.map((review, index) => (
                <div key={index} className="overflow-y-auto overflow-x-clip min-h-32 min-w-64 p-6 bg-gray-100">
                    <div className="flex flex-row gap-2">
                        <a className="hover:underline" href={`/user/${review.reviewer_first_usename}`}>{review.reviewer_username}</a>
                        <p><span className="text-yellow-500">★</span><span>{review.stars}</span></p>
                    </div>
                    <div className="text-gray-600">{review.text}</div>
                </div>
            ))}
        </div>
    );
}
