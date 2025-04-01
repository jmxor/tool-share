"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function PostImageCarousel({
  pictures,
}: {
  pictures: string[];
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : pictures.length - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < pictures.length - 1 ? prevIndex + 1 : 0,
    );
  };

  return (
    <div className="relative h-24 w-full">
      {pictures.length > 1 && (
        <button
          onClick={handlePrevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
        >
          <ChevronLeft />
        </button>
      )}
      <Image
        src={pictures[currentImageIndex]}
        alt="Tool Image"
        width={200}
        height={100}
        className="rounded-md object-cover"
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
      />
      {pictures.length > 1 && (
        <button
          onClick={handleNextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}
