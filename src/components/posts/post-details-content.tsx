"use client";

import { AllToolPostData } from "@/lib/posts/actions";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { requestTransaction } from "@/lib/transactions/actions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function PostDetailsContent({
  post,
  loggedIn,
}: {
  post: AllToolPostData;
  loggedIn: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestedDays, setRequestedDays] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : post.pictures.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < post.pictures.length - 1 ? prevIndex + 1 : 0
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
    <div className="mb-auto flex min-h-[calc(100vh-64px)] w-full flex-1 justify-center bg-gray-50 px-4">
      <div className="my-4 h-fit w-full max-w-md space-y-2 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Tool Details
        </h2>

        <div className="space-y-2">
          <div className="min-h-[439px] space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Images*
            </label>

            <div className="relative flex w-full overflow-clip">
              {post.pictures.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 z-50 -translate-y-1/2 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
                >
                  <ChevronLeft />
                </button>
              )}

              {post.pictures.map((image_url) => (
                <div
                  key={image_url}
                  className="mt-0 aspect-square w-full shrink-0 overflow-clip rounded-md border border-input"
                  style={{
                    transform: `translate(-${currentImageIndex * 100}%)`,
                  }}
                >
                  <Image
                    src={image_url}
                    alt={"Tool Image"}
                    width={100}
                    height={100}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              ))}

              {post.pictures.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
                >
                  <ChevronRight />
                </button>
              )}
            </div>
          </div>

          <div className="min-h-[75px] space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Categories
            </label>
            <div className="flex min-h-[38px] w-full flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
              {post?.categories.map((c1) => <Badge key={c1}>{c1}</Badge>)}
            </div>
          </div>

          <div className="min-h-[84px] space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Name
            </label>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
              {post?.tool_name}
            </div>
          </div>

          <div className="min-h-[108px] space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Description
            </label>
            <div className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
              {post?.description}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="min-h-[84px] space-y-0.5">
              <label htmlFor="" className="text-sm font-medium">
                Deposit
              </label>

              <div className="flex">
                <div className="flex h-[38px] shrink-0 items-center justify-center rounded-md rounded-r-none border border-r-0 border-input px-3 shadow-sm">
                  £
                </div>
                <div className="flex min-h-[38px] w-full items-center rounded-md rounded-l-none border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
                  {post?.deposit}
                </div>
              </div>
            </div>

            <div className="min-h-[84px] space-y-0.5">
              <label htmlFor="" className="text-sm font-medium">
                Max Borrow Period
              </label>
              <div className="flex">
                <div className="flex min-h-[38px] w-full items-center rounded-md rounded-r-none border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
                  {post?.max_borrow_days}
                </div>
                <div className="flex h-[38px] shrink-0 items-center justify-center rounded-md rounded-l-none border border-l-0 border-input px-3 shadow-sm">
                  days
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-[84px] space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Postcode
            </label>
            <div className="flex min-h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
              {post?.postcode}
            </div>
          </div>

          {loggedIn ? (
            <Button
              className="mt-0.5 h-9 w-full"
              size="sm"
              onClick={handleBorrowClick}
            >
              {post.status === "available" ? "Borrow" : "Join Queue"}
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="mt-0.5 w-full bg-blue-600 hover:bg-blue-500"
            >
              <Link href="/auth/login">Login to Borrow</Link>
            </Button>
          )}
        </div>
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
