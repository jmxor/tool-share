"use client";

import type { Marker } from "@googlemaps/markerclusterer";
import React, { useCallback, useState } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { AllToolPostData } from "@/lib/posts/actions";
import Image from "next/image";

export type PostMarkerProps = {
  post: AllToolPostData;
  onClick: (post: AllToolPostData) => void;
  setMarkerRef: (marker: Marker | null, key: number) => void;
};

export default function PostMarker(props: PostMarkerProps) {
  const { post, onClick, setMarkerRef } = props;
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseExit = () => {
    setIsHovered(false);
  };

  const handleClick = useCallback(() => onClick(post), [onClick, post]);
  const ref = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement) =>
      setMarkerRef(marker, post.id),
    [setMarkerRef, post.id],
  );

  return (
    <AdvancedMarker
      position={{ lat: post.latitude, lng: post.longitude }}
      clickable={true}
      onClick={handleClick}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseExit}
      title={post.tool_name}
      zIndex={isHovered ? 50 : 0}
    >
      <div className="group flex size-12 items-center overflow-clip rounded-full border-2 border-black bg-white hover:h-16 hover:w-auto hover:p-2 hover:pl-0">
        <div className="size-12 overflow-clip rounded-full group-hover:size-16">
          <Image
            src={post.pictures[0]}
            alt={post.tool_name}
            width={48}
            height={48}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </div>
        <div className="flex w-0 flex-col transition-all group-hover:mx-2 group-hover:w-auto">
          <h3 className="truncate text-lg font-semibold capitalize">
            {post.tool_name}
          </h3>
          <span className="text-sm">{post.deposit} deposit</span>
        </div>
      </div>
    </AdvancedMarker>
  );
}
