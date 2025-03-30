"use client";

import { forwardRef, useState } from "react";
import { AllToolPostData } from "@/lib/posts/actions";
import { Button } from "@/components/ui/button";
import { requestTransaction } from "@/lib/transactions/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PostImageCarousel from "./posts/post-image-carousel";

type PostCardProps = {
  post: AllToolPostData;
  isHighlighted: boolean;
};

const PostCard = forwardRef<HTMLDivElement, PostCardProps>(
  ({ post, isHighlighted }, ref) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [requestedDays, setRequestedDays] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { toast } = useToast();

    const handlePrevImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : post.pictures.length - 1,
      );
    };

    const handleNextImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < post.pictures.length - 1 ? prevIndex + 1 : 0,
      );
    };

    const handleBorrowClick = () => {
      setIsDialogOpen(true);
      setErrorMessage(null);
    };

    const handleRequestSubmit = async () => {
      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const result = await requestTransaction(post.id, requestedDays);
        if (result.success) {
          window.location.href = `/transactions/request/${result.transaction_id}`;
        } else {
          setIsSubmitting(false);
          setErrorMessage(result.message || "Failed to request transaction");
          toast({
            title: "Request Failed",
            description: result.message || "Failed to request transaction",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to request transaction:", error);
        setIsSubmitting(false);
        setErrorMessage("An unexpected error occurred. Please try again.");
        toast({
          title: "Request Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

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
          <Button
            className="w-full"
            size="sm"
            onClick={handleBorrowClick}
          >
            {post.status === 'available' ? 'Borrow' : 'Join Queue'}
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Borrow {post.tool_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {errorMessage && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="days">How many days do you need it?</Label>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  max={post.max_borrow_days}
                  value={requestedDays}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > post.max_borrow_days) {
                      setRequestedDays(post.max_borrow_days);
                    } else if (value < 1) {
                      setRequestedDays(1);
                    } else {
                      setRequestedDays(value);
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Maximum borrow period: {post.max_borrow_days} days
                </p>
              </div>
              <div>
                <p className="text-sm">Deposit required: {post.deposit}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRequestSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Request to Borrow"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

PostCard.displayName = "PostCard";

export default PostCard;
