"use client";

import { AllToolPostData } from "@/lib/posts/actions";
import { Map, useMap } from "@vis.gl/react-google-maps";
import { type Marker, MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import PostMarker from "@/components/post-marker";

export default function ToolsMap({
  tools,
  postRefs,
}: {
  tools: AllToolPostData[];
  postRefs: MutableRefObject<{ [id: number]: HTMLDivElement | null }>;
}) {
  const [markers, setMarkers] = useState<{ [id: number]: Marker }>({});

  const map = useMap();
  const clusterer = useMemo(() => {
    if (!map) return null;

    return new MarkerClusterer({ map });
  }, [map]);

  useEffect(() => {
    if (!clusterer) return;

    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markers));
  }, [clusterer, markers]);

  const setMarkerRef = useCallback((marker: Marker | null, id: number) => {
    setMarkers((markers) => {
      if ((marker && markers[id]) || (!marker && !markers[id])) return markers;

      if (marker) {
        return { ...markers, [id]: marker };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...newMarkers } = markers;

        return newMarkers;
      }
    });
  }, []);

  const handleMarkerClick = (tool: AllToolPostData) => {
    postRefs.current[tool.id]?.scrollIntoView();
  };

  return (
    <Map
      mapId={"test"}
      defaultZoom={12}
      defaultCenter={{ lat: 51.4892, lng: -3.1786 }}
      gestureHandling={"greedy"}
      disableDefaultUI={true}
    >
      {tools.map((tool) => (
        <PostMarker
          key={tool.id}
          post={tool}
          onClick={handleMarkerClick}
          setMarkerRef={setMarkerRef}
        />
      ))}
    </Map>
  );
}
