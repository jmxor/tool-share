"use client";

import { AllToolPostData } from "@/lib/posts/actions";
import { createContext, Dispatch, SetStateAction, useState } from "react";
import PostCard from "@/components/post-card";
import ToolsDataTable from "@/components/tools-data-table";
import ToolsMap from "@/components/tools-map";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PostsContextType {
  currentPostId: number | null;
  setCurrentPostId: Dispatch<SetStateAction<number | null>>;
}

export const PostsContext = createContext<PostsContextType>({
  currentPostId: null,
  setCurrentPostId: () => {},
});

export default function ToolsPageContent({
  tools,
}: {
  tools: AllToolPostData[];
}) {
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);

  return (
    <PostsContext.Provider value={{ currentPostId, setCurrentPostId }}>
      <div className="grid grid-cols-2 gap-2 p-2 lg:grid-cols-6 lg:px-4">
        <div className="col-span-full flex items-center justify-center gap-2">
          <p>Have a tool to share?</p>
          <Button variant="outline" asChild>
            {/* This link needs to be an anchor element not a Next Link to prevent issues when submitting the form on
            /tools/new page. For reference: https://github.com/vercel/next.js/discussions/56234 */}
            <a href="/tools/new">
              <Plus />
              Share Tool
            </a>
          </Button>
        </div>

        <div className="col-span-2 row-span-3 grid grid-cols-subgrid grid-rows-subgrid lg:col-span-3">
          <div className="col-span-full row-span-2 flex h-72 items-center justify-center overflow-clip rounded-md border lg:col-span-3 lg:h-auto">
            <ToolsMap tools={tools} />
          </div>

          <div className="col-span-full row-span-1 flex items-center justify-center rounded-md border font-bold lg:col-span-3">
            Map controls & Filtering
          </div>
        </div>

        {tools.map((tool) => (
          <PostCard
            key={tool.id}
            post={tool}
            isHighlighted={tool.id == currentPostId}
          />
        ))}

        <ToolsDataTable data={tools} />
      </div>
    </PostsContext.Provider>
  );
}
