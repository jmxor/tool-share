"use client";

import PostCard from "@/components/post-card";
import ToolsDataTable from "@/components/tools-data-table";
import ToolsMap from "@/components/tools-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AllToolPostData } from "@/lib/posts/actions";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Plus } from "lucide-react";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import PostFiltersForm from "./post-filters-form";
import { ScrollArea } from "./ui/scroll-area";

interface PostsContextType {
  selectedPostId: number | null;
  setSelectedPostId: Dispatch<SetStateAction<number | null>>;
}

export const PostsContext = createContext<PostsContextType>({
  selectedPostId: null,
  setSelectedPostId: () => {},
});

export default function ToolsPageContent({
  tools,
}: {
  tools: AllToolPostData[];
}) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [filteredPosts, setFilteredPosts] = useState(tools);
  const [postNameFilter, setPostNameFilter] = useState("");
  const [minBorrowFilter, setMinBorrowFilter] = useState(0);
  const [maxDepositFilter, setMaxDepositFilter] = useState<number>(0);

  const postRefs = useRef<{ [id: number]: HTMLDivElement | null }>({});

  useEffect(() => console.log(postRefs.current));

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
    <PostsContext.Provider value={{ selectedPostId, setSelectedPostId }}>
      <APIProvider apiKey={API_KEY}>
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
              <ToolsMap tools={filteredPosts} postRefs={postRefs} />
            </div>

            <PostFiltersForm />
          </div>

          {/* TODO: properly calculate the card height and width for grid rows and columns */}
          <ScrollArea className="col-span-2 row-span-3 lg:col-span-3 lg:max-h-[742px]">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isHighlighted={post.id == selectedPostId}
                  ref={(element) => (postRefs.current[post.id] = element)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </APIProvider>
    </PostsContext.Provider>
  );
}
