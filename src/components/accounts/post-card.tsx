"use client"

import { useState } from 'react';
import Image from 'next/image';
import { Post } from "@/lib/types";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PostCard({ post }: { post: Post }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : post.sources.length - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex < post.sources.length - 1 ? prevIndex + 1 : 0
        );
    };

    return (
        <div className="flex flex-col items-center p-4 border rounded-lg shadow-md min-w-56">
            <div className="relative w-full h-48">
                {post.sources.length > 1 && (
                    <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-1 opacity-75 hover:opacity-100"
                    >
                        <ChevronLeft />
                    </button>
                )}
                <Image
                    src={post.sources[currentImageIndex]}
                    alt="Tool Image"
                    width={200}
                    height={200}
                    className="rounded-md object-cover"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                {post.sources.length > 1 && (
                    <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-1 opacity-75 hover:opacity-100"
                    >
                        <ChevronRight />
                    </button>
                )}
            </div>
            <h3 className="font-semibold mt-2 overflow-hidden text-nowrap">{post.tool_name}</h3>
            <p className="text-gray-600 text-sm overflow-auto h-10">{post.description}</p>
            <a
                href={`/tool/${post.id}`}
                className="mt-2 text-blue-500 hover:text-blue-700 transition-colors duration-200"
            >
                View Listing &rarr;
            </a>
        </div>
    );
}
