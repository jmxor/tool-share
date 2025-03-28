"use client";

import { AllToolPostData } from "@/lib/posts/actions";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function PostDetailsContent({
  post,
}: {
  post: AllToolPostData;
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
    <div className="mb-auto flex min-h-[calc(100vh-64px)] w-full flex-1 justify-center bg-gray-50 px-4">
      <div className="my-4 h-fit w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h2 className="mt-0 text-center text-3xl font-bold text-gray-800">
          Tool Details
        </h2>

        <div className="space-y-2 p-2 lg:px-4">
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
                className="mt-0 aspect-square w-full shrink-0 overflow-clip rounded-md"
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

          <div className="space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Name
            </label>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
              {post?.tool_name}
            </div>
          </div>
          <div className="space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Description
            </label>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
              {post?.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
