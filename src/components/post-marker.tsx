import type { Marker } from "@googlemaps/markerclusterer";
import React, { useCallback } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { AllToolPostData } from "@/lib/posts/actions";

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
    />
  );
}
