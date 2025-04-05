"use client";

import { forwardRef, useEffect, useState } from "react";
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
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CircleUser, MapPin } from "lucide-react";
import { getUserRowFromId } from "@/lib/auth/actions";

type PostCardProps = {
  post: AllToolPostData;
  isHighlighted: boolean;
  loggedIn: boolean;
  currentUserId: null | number;
};

const PostCard = forwardRef<HTMLDivElement, PostCardProps>(
  ({ post, isHighlighted, loggedIn, currentUserId }, ref) => {
    const [ownerUsername, setOwnerUsername] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [requestedDays, setRequestedDays] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      async function fetchOwnerUsername() {
        const ownerUserRow = await getUserRowFromId(post.user_id);
        setOwnerUsername(ownerUserRow.username);
      }
      fetchOwnerUsername();
    });

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

        <div className="flex gap-2 overflow-scroll p-2 pb-0">
          {post.categories.map((c) => (
            <Badge key={c} className="shrink-0">
              {c}
            </Badge>
          ))}
        </div>

        <div className="p-2 lg:px-4">
          <div className="flex justify-between">
            <h3 className="truncate text-lg font-semibold capitalize">
              {post.tool_name}
            </h3>
            <span>
              {post.status == "available" ? (
                <Badge className="bg-green-500 hover:bg-green-400">
                  Available
                </Badge>
              ) : (
                <Badge className="bg-amber-400 hover:bg-amber-300">
                  On Loan
                </Badge>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm">
              <MapPin size={13} /> {post.postcode}
            </span>
            <span className="text-sm">£{post.deposit} deposit</span>
            <span className="flex items-center text-sm">
              <Link
                href={`/user/${ownerUsername}`}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <CircleUser size={13} />
                {ownerUsername}
              </Link>
            </span>
          </div>

          <p className="line-clamp-2 h-10 text-sm text-gray-600">
            {post.description}
          </p>
        </div>
        <div className="flex gap-2 px-2 pb-2">
          {currentUserId && currentUserId == post.user_id ? (
            <Button
              className="w-full bg-amber-400 hover:bg-amber-300"
              size="sm"
              asChild
            >
              {/* TODO: change button content to Edit if current user is owner */}
              <a href={`/tools/${post.id}/edit`}>Edit</a>
            </Button>
          ) : (
            <Button className="w-full" size="sm" asChild>
              {/* TODO: change button content to Edit if current user is owner */}
              <a href={`/tools/${post.id}`}>Details</a>
            </Button>
          )}

          {loggedIn ? (
            <Button className="w-full" size="sm" onClick={handleBorrowClick}>
              {post.status === "available" ? "Borrow" : "Join Queue"}
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              <Link href="/auth/login">Login to Borrow</Link>
            </Button>
          )}
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
              <Button onClick={handleRequestSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Request to Borrow"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;
