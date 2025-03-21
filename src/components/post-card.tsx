import { forwardRef } from "react";
import { AllToolPostData } from "@/lib/posts/actions";
import { Button } from "@/components/ui/button";
import PostImageCarousel from "./posts/post-image-carousel";

type PostCardProps = {
  post: AllToolPostData;
  isHighlighted: boolean;
};

export const PostCard = forwardRef<HTMLDivElement, PostCardProps>(
  ({ post, isHighlighted }, ref) => {
    return (
      <div
        className={`col-span-1 flex flex-col rounded-lg border shadow-md ${isHighlighted ? "border-black" : "hover:border-black"}`}
        ref={ref}
      >
        <PostImageCarousel pictures={post?.pictures} />

        <div className="p-2 lg:px-4">
          <h3 className="truncate text-lg font-semibold capitalize">
            {post.tool_name}
          </h3>
          <div className="flex justify-between">
            <span className="text-sm">{post.postcode}</span>
            <span className="text-sm">{post.deposit} deposit</span>
            {/* <span className="text-sm">{post.max_borrow_days}</span> */}
          </div>

          <p className="line-clamp-2 h-10 text-sm text-gray-600">
            {post.description}
          </p>
        </div>
        <div className="flex gap-2 px-2 pb-2">
          <Button className="w-full" size="sm" asChild>
            {/* TODO: change button content to Edit if current user is owner */}
            <a href={`/tools/${post.id}`}>Details</a>
          </Button>
          <Button className="w-full" size="sm">
            {/* TODO: change button content if tool is currently borrowed */}
            Borrow
          </Button>
        </div>
      </div>
    );
  },
);

PostCard.displayName = "PostCard";

export default PostCard;
