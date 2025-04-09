import {
  getEmailID,
  getPublicUserData,
  getReviews,
  getUserByEmail,
  Review,
} from "@/lib/auth/actions";
import { PublicUser } from "@/lib/types";
import { UserRound, Flag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReviewForm from "@/components/accounts/review-form";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import DeleteReviewButton from "@/components/accounts/delete-review-button";
import PostCard from "@/components/post-card";
import { AllToolPostData } from "@/lib/posts/actions";
import SendMessageButton from "@/components/SendMessageComponent";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ first_username: string }>;
}) {
  const session = await auth();
  let loggedIn = false;
  let loggedInFirstUsername: string | null = null;
  let currentUserId: number | null = null;

  if (session?.user?.email) {
    loggedIn = true;
    currentUserId = await getEmailID(session.user.email);

    const userData = await getUserByEmail(session.user.email);
    if (userData) {
      loggedInFirstUsername = userData?.first_username;
    }
  }

  const first_username = (await params).first_username;
  const publicUserData: PublicUser | null =
    await getPublicUserData(first_username);

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
    starCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }

  return (
    <div className="mr-0 mt-10 flex flex-col items-center gap-4 md:items-center md:gap-6 lg:mr-24 lg:flex-row lg:items-stretch lg:gap-0">
      <div className="flex w-1/5 min-w-64 flex-col items-center gap-4">
        <UserRound
          width="6rem"
          height="6rem"
          color="#333333"
          className="rounded-full border-4 border-neutral-200 p-4"
        />
        <p className="text-lg font-semibold">
          {first_username === loggedInFirstUsername
            ? `YOU (${publicUserData.username})`
            : publicUserData.username}
        </p>
        <div className="flex flex-col gap-2">
          {publicUserData.is_suspended && (
            <Badge variant="destructive" className="flex items-center gap-1">
              This user is currently suspended
            </Badge>
          )}
          <p className="text-sm">
            Joined <span>{formatDate(publicUserData.created_at)}</span>
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          {first_username !== loggedInFirstUsername ? (
            <>
              <SendMessageButton
                email={session?.user!.email as string}
                first_username={first_username}
              />
              <a
                href={`/reports/new/${first_username}`}
                className="flex items-center gap-1 rounded-none bg-transparent px-4 py-1 font-semibold text-red-400 shadow-none hover:cursor-pointer hover:bg-transparent hover:underline"
              >
                Report
                <Flag className="h-4 w-4" />
              </a>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="flex w-4/5 flex-grow flex-col overflow-hidden bg-white shadow-lg">
        <div className="flex flex-col items-center md:flex-row">
          <div className="flex min-w-60 flex-col items-center gap-2 px-16 py-6">
            <p className="mb-2 text-lg text-neutral-700">
              <span className="">{reviews?.length || 0}</span> user reviews
            </p>
            <div className="flex flex-col">
              {[5, 4, 3, 2, 1].map((numStars) => (
                <p key={numStars} className="text-sm text-neutral-600">
                  <span className="font-semibold">
                    {(reviews?.length || 0) > 0
                      ? Math.round(
                          ((starCount[numStars] || 0) /
                            (reviews?.length || 0)) *
                            100
                        )
                      : 0}
                    %
                  </span>{" "}
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
                    className="mt-2 rounded-none bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-md hover:bg-gray-100 disabled:bg-neutral-50 disabled:text-gray-400"
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
                className="mt-2 rounded-none bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-md hover:bg-gray-100"
                href="/auth/login"
              >
                Login to Review
              </a>
            )}
          </div>
          <div className="max-h-64 overflow-auto">
            <div className="my-2 flex min-w-64 flex-col items-center gap-2 md:flex-row">
              {reviews?.map((review) => (
                <div
                  key={review.id}
                  className="h-52 w-64 min-w-64 overflow-hidden rounded-lg border-2 border-neutral-50 p-4 md:w-80"
                >
                  <a
                    href={`/user/${review.reviewer_first_usename}`}
                    className="truncate text-sm font-semibold hover:underline"
                  >
                    {review.reviewer_username === loggedInFirstUsername ? (
                      <span className="text-blue-500">YOU</span>
                    ) : (
                      review.reviewer_username
                    )}
                  </a>
                  <p className="text-sm font-bold">
                    <span className="text-yellow-500">
                      {"☆".repeat(review.stars)}
                    </span>
                    <span className="text-gray-300">
                      {"☆".repeat(5 - review.stars)}
                    </span>
                  </p>
                  <div className="mt-2 h-4/5 overflow-auto break-words">
                    {review.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 px-2 lg:px-14">
          <h2 className="text-xl">Tools Listed</h2>
          <hr />
          {publicUserData.posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 overflow-x-auto py-8 lg:grid-cols-3 lg:grid-rows-1">
              {publicUserData.posts.map((post: AllToolPostData) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isHighlighted={false}
                  loggedIn={loggedIn}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-xl text-gray-400">
              No Posts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
