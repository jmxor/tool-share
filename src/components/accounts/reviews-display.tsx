import { getReviews, Review } from "@/lib/auth/actions";

export default async function ReviewsDisplay({ first_username }: { first_username: string }) {
    const reviews: Review[] | null = await getReviews(first_username);

    if (!reviews || reviews.length <= 0) {
        return <div>This user has no reviews.</div>
    }
    return (
        <div className="flex flex-col md:flex-row gap-2 overflow-x-auto max-h-52 pb-4 max-w-xs md:max-w-md lg:max-w-full">
            {reviews.map((review, index) => (
                <div
                    key={index}
                    className="flex-1 min-w-64 max-w-md overflow-y-auto overflow-x-clip break-words p-6 bg-gray-50 shadow-sm min-h-24"
                >
                    <div className="flex flex-row gap-2">
                        <a
                            className="hover:underline"
                            href={`/user/${review.reviewer_first_usename}`}
                        >
                            {review.reviewer_username}
                        </a>
                        <p>
                            <span className="text-yellow-500">★</span>
                            <span>{review.stars}</span>
                        </p>
                    </div>
                    <p className="text-gray-600">{review.text}</p>
                </div>
            ))}
        </div>
    );
}
