"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AllToolPostData } from "@/lib/posts/actions";
import { Button } from "./ui/button";

export default function PostCard({
  post,
  isHighlighted,
}: {
  post: AllToolPostData;
  isHighlighted: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <div
      className={`col-span-1 flex flex-col rounded-lg border shadow-md ${isHighlighted ? "border-black" : "hover:border-black"}`}
    >
      <div className="relative h-24 w-full">
        {post.pictures.length > 1 && (
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
          >
            <ChevronLeft />
          </button>
        )}
        <Image
          src={post.pictures[currentImageIndex]}
          alt="Tool Image"
          width={200}
          height={100}
          className="rounded-md object-cover"
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
        {post.pictures.length > 1 && (
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
          >
            <ChevronRight />
          </button>
        )}
      </div>
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
          <a href={`/tool/${post.id}`}>Details</a>
        </Button>
        <Button className="w-full" size="sm">
          {/* TODO: change button content if tool is currently borrowed */}
          Borrow
        </Button>
      </div>
    </div>
  );
}
