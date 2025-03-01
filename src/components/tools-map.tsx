"use client";

import { AllToolPostData } from "@/lib/posts/actions";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export default function ToolsMap({ tools }: { tools: AllToolPostData[] }) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

  // TOD0: add marker clustering, and a method to differentiate unstacked tools
  return (
    <APIProvider apiKey={API_KEY} onLoad={() => console.log(API_KEY)}>
      <Map
        mapId={"test"}
        defaultZoom={12}
        defaultCenter={{ lat: 51.4892, lng: -3.1786 }}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      >
        {tools.map((tool) => (
          <Marker
            key={tool.id}
            position={{ lat: tool.latitude, lng: tool.longitude }}
            clickable={true}
            onClick={() => alert(tool.tool_name)}
            title={tool.tool_name}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
