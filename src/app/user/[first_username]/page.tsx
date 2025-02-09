import { getPublicUserData } from "@/lib/auth/actions";
import { PublicUser } from "@/lib/types";
import { UserRound, Calendar1, Gavel } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default async function ProfilePage({
	params,
}: {
	params: Promise<{ first_username: string }>
}) {
	const first_username = (await params).first_username;
	const publicUserData: PublicUser | null = await getPublicUserData(first_username);

	return (
		<div className="flex min-h-screen w-full justify-center bg-gray-50 px-4">
			<TooltipProvider>
				<div className="flex flex-row gap-2 h-fit max-w-full w-full">
					<div className="flex flex-col bg-white shadow-md items-center mb-4 gap-2 min-w-64 p-8 rounded-lg mt-2 h-fit">
						<div className="bg-gray-100 w-20 h-20 rounded-full flex justify-center items-center">
							<UserRound width="3rem" height="3rem" color="#333333" className="" />
						</div>
						<span className="font-medium text-xl">{publicUserData!.username}</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex gap-2 text-gray-600 text-sm font-medium items-center cursor-help">
									<Calendar1 height="1rem" />
									{formatDate(publicUserData!.created_at)}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Member Since</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex gap-2 text-gray-600 text-sm font-medium items-center cursor-help">
									<Gavel height="1rem" />
									<p className={publicUserData!.suspensionCount > 0 ? "text-red-500" : "text-green-500"}>
										{publicUserData!.suspensionCount}
									</p>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Number of Suspensions</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<div className="flex flex-col bg-white shadow-md mb-4 gap-2 p-14 rounded-lg mt-2 flex-grow h-[50rem]">
						<h2 className="font-medium text-xl">Feedback</h2>
						<div className="h-32">
							Leave your own review
						</div>
						<Carousel className="w-full" >
							<CarouselContent className="-ml-1">
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-100 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-300 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-100 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-300 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-100 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-300 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-100 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-300 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-100 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-300 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-100 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-300 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-100 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-300 h-48">This is a review</CarouselItem>
								<CarouselItem className="basis-1/2 lg:basis-1/6 bg-gray-100 h-48">This is a review</CarouselItem>
							</CarouselContent>
							<CarouselPrevious />
							<CarouselNext />
						</Carousel>
					</div>
				</div>
			</TooltipProvider>
		</div>
	);
}
