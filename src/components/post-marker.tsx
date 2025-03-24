import type { Marker } from "@googlemaps/markerclusterer";
import React, { useCallback } from "react";
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
      // onMouseEnter={() => setSelectedPostId(tool.id)}
      // onMouseLeave={() => setSelectedPostId(null)}
      title={post.tool_name}
    >
      <div className="size-12 overflow-clip rounded-full border-2 border-black">
        <Image
          src={post.pictures[0]}
          alt={post.tool_name}
          width={48}
          height={48}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </div>
    </AdvancedMarker>
  );
}
