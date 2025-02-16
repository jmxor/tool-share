import { getPublicUserData, getReviews, getUserByEmail, Review } from "@/lib/auth/actions";
import { PublicUser } from "@/lib/types";
import { UserRound, MessageCircle, Flag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import ReviewForm from "@/components/accounts/review-form";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import DeleteReviewButton from "@/components/accounts/delete-review-button";

export default async function ProfilePage({
	params,
}: {
	params: Promise<{ first_username: string }>
}) {
	const session = await auth();
	let loggedIn = false;
	let loggedInFirstUsername: string | null = null;

	if (session?.user?.email) {
		loggedIn = true;
		const userData = await getUserByEmail(session.user.email);
		if (userData) {
			loggedInFirstUsername = userData?.username;
		}
	}

	const first_username = (await params).first_username;
	const publicUserData: PublicUser | null = await getPublicUserData(first_username);

	if (!publicUserData) {
		notFound();
	}

	const reviews: Review[] | null = await getReviews(first_username);

	// Move the logged-in user's review to the front
	if (reviews && loggedInFirstUsername) {
		const loggedInUserReviewIndex = reviews.findIndex(
			(review) => review.reviewer_first_usename === loggedInFirstUsername
		);

		if (loggedInUserReviewIndex > -1) {
			const loggedInUserReview = reviews.splice(loggedInUserReviewIndex, 1)[0];
			reviews.unshift(loggedInUserReview);
		}
	}
	const reviewed: boolean | undefined = reviews?.some(
		(review) =>
			review.reviewer_first_usename &&
			loggedInFirstUsername &&
			review.reviewer_first_usename === loggedInFirstUsername
	);

	let starCount: { [key: number]: number };
	if (reviews && reviews.length > 0) {
		starCount = reviews?.reduce((acc: { [key: number]: number }, review) => {
			const stars = review.stars;
			acc[stars] = (acc[stars] || 0) + 1;
			return acc;
		}, {});
	} else {
		starCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
	}

	return (

		<div
			className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-0 items-center md:items-center lg:items-stretch mt-10 mr-0 lg:mr-24"
		>
			<div
				className="flex flex-col gap-4 min-w-64 w-1/5 items-center"
			>
				<UserRound width="6rem" height="6rem" color="#333333" className="p-4 border-4 rounded-full border-neutral-200" />
				<p className="font-semibold text-lg">{first_username === loggedInFirstUsername ? `YOU (${publicUserData.username})` : publicUserData.username}</p>
				<div className="flex flex-col gap-2">
					<p className="text-sm">
						Joined <span>{formatDate(publicUserData.created_at)}</span>
					</p>
					<p className="text-sm"><span className="font-bold">5</span> transactions</p>
					<p className="text-sm"><span className="font-bold">{publicUserData.suspensionCount}</span> suspensions</p>
				</div>
				<div className="flex flex-col gap-1 items-center">
					<Button
						disabled={first_username === loggedInFirstUsername}
						className="rounded-none font-semibold bg-blue-500 items-center text-white px-4 py-1 shadow-md hover:cursor-pointer hover:bg-blue-600 flex gap-1"
					>
						Message<MessageCircle className="w-4 h-4" />
					</Button>
					<Button
						disabled={first_username === loggedInFirstUsername}
						className="px-4 py-1 font-semibold text-red-400 hover:cursor-pointer hover:underline flex items-center gap-1 bg-transparent rounded-none shadow-none hover:bg-transparent"
					>
						Report<Flag className="w-4 h-4" />
					</Button>
				</div>
			</div>
			<div
				className="flex flex-col bg-white flex-grow shadow-lg overflow-hidden w-4/5"
			>
				<div
					className="flex flex-col md:flex-row"
				>
					<div
						className="flex flex-col gap-2 py-6 px-16 min-w-60 items-center"
					>
						<p className="text-neutral-700 text-lg mb-2"><span className="">{reviews?.length || 0}</span> user reviews</p>
						<div
							className="flex flex-col"
						>
							{[5, 4, 3, 2, 1].map((numStars) => (
								<p
									key={numStars}
									className="text-neutral-600 text-sm"
								>
									<span className="font-semibold">
										{(reviews?.length || 0) > 0
											? Math.round((starCount[numStars] || 0) / (reviews?.length || 0) * 100)
											: 0}
										%
									</span>
									{" "}
									{"☆".repeat(numStars)}
								</p>
							))}
						</div>
						{loggedIn ? (
							reviewed ? (
								<DeleteReviewButton first_username={first_username} />
							) : (
								<Dialog>
									<DialogTrigger
										disabled={first_username === loggedInFirstUsername}
										className="disabled:bg-neutral-50 disabled:text-gray-400 mt-2 text-xs bg-gray-50 shadow-md font-semibold text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-none"
									>
										Write review
									</DialogTrigger>
									<DialogContent>
										<DialogTitle>Write a review</DialogTitle>
										<ReviewForm first_username={first_username} />
									</DialogContent>
								</Dialog>
							)
						) : (
							<a
								className="mt-2 text-xs bg-gray-50 shadow-md font-semibold text-gray-700 px-4 py-2 hover:bg-gray-100 rounded-none"
								href="/auth/login"
							>
								Login to Review
							</a>
						)}
					</div>
					<div className="max-h-64 overflow-auto">
						<div
							className="flex flex-col md:flex-row gap-2 items-center min-w-64 my-2"
						>
							{reviews?.map((review) => (
								<div
									key={review.id}
									className="w-64 md:w-80 h-52 p-4 overflow-hidden min-w-64 border-neutral-50 border-2 rounded-lg"
								>
									<a
										href={`/user/${review.reviewer_first_usename}`}
										className="font-semibold text-sm truncate hover:underline"
									>
										{review.reviewer_username === loggedInFirstUsername ? (
											<span className="text-blue-500">YOU</span>
										) : (
											review.reviewer_username
										)}
									</a>
									<p className="text-sm font-bold">
										<span className="text-yellow-500">{'☆'.repeat(review.stars)}</span>
										<span className="text-gray-300">{'☆'.repeat(5 - review.stars)}</span>
									</p>
									<div
										className="overflow-auto break-words h-4/5 mt-2"
									>
										{review.text}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div
					className="px-14 mt-8"
				>
					<h2
						className="text-xl"
					>
						Tools Listed
					</h2>
					<hr />
					{publicUserData.posts.length > 0 ?
						<div>
						</div> :
						<div
							className="flex items-center justify-center text-xl text-gray-400 py-10"
						>
							No Listings
						</div>
					}
				</div>
			</div>
		</div>
	);
}
