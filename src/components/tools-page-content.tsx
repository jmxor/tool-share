"use client";

import PostCard from "@/components/post-card";
import ToolsDataTable from "@/components/tools-data-table";
import ToolsMap from "@/components/tools-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AllToolPostData } from "@/lib/posts/actions";
import { Plus } from "lucide-react";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";

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
  const [filteredPosts, setFilteredPosts] = useState(tools);
  const [postNameFilter, setPostNameFilter] = useState("");
  const [minBorrowFilter, setMinBorrowFilter] = useState(0);
  const [maxDepositFilter, setMaxDepositFilter] = useState<number>(0);

  useEffect(() => {
    setFilteredPosts(
      tools.filter(
        (post) =>
          post.tool_name.toLowerCase().includes(postNameFilter.toLowerCase()) &&
          post.max_borrow_days > minBorrowFilter &&
          (maxDepositFilter <= 0 ||
            parseFloat(post.deposit) <= maxDepositFilter),
      ),
    );
  }, [tools, postNameFilter, minBorrowFilter, maxDepositFilter]);

  return (
    <PostsContext.Provider value={{ currentPostId, setCurrentPostId }}>
      <div className="col-span-full mt-2 flex items-center justify-center gap-2">
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

      {/* TODO fix rows collapsing when empty of tools */}
      <div className="grid grid-cols-2 gap-2 p-2 lg:grid-cols-6 lg:px-4">
        <div className="col-span-2 row-span-3 grid grid-cols-subgrid grid-rows-subgrid lg:col-span-3">
          <div className="col-span-full row-span-2 flex h-72 items-center justify-center overflow-clip rounded-md border lg:col-span-3 lg:h-auto">
            <ToolsMap tools={filteredPosts} />
          </div>

          {/* TODO: use ZOD and ShadCN forms instead */}
          <div className="col-span-full row-span-1 flex flex-col gap-2 lg:col-span-3">
            <Input
              type="search"
              placeholder="Filter tools..."
              value={postNameFilter}
              onChange={(e) => setPostNameFilter(e.target.value)}
            />
            <Input
              type="number"
              placeholder=""
              value={minBorrowFilter}
              onChange={(e) => setMinBorrowFilter(parseInt(e.target.value))}
            />
            <Input
              type="number"
              step={0.01}
              placeholder="Filter tools..."
              value={maxDepositFilter}
              onChange={(e) => setMaxDepositFilter(parseFloat(e.target.value))}
            />

            <h1 className="flex items-center justify-center rounded-md border font-bold">
              Map controls & Filtering
            </h1>
          </div>
        </div>

        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isHighlighted={post.id == currentPostId}
          />
        ))}

        <ToolsDataTable data={filteredPosts} />
      </div>
    </PostsContext.Provider>
  );
}
