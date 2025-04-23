"use client";

import PostCard from "@/components/post-card";
import ToolsMap from "@/components/tools-map";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
interface PostsContextType {
  selectedPostId: number | null;
  setSelectedPostId: Dispatch<SetStateAction<number | null>>;
}

export const PostsContext = createContext<PostsContextType>({
  selectedPostId: null,
  setSelectedPostId: () => {},
});

export type PostFilterState = {
  name: string;
  location: string;
  max_deposit: number;
  min_borrow_days: number;
};

export default function ToolsPageContent({
  tools,
  loggedIn,
  currentUserId,
}: {
  tools: AllToolPostData[];
  loggedIn: boolean;
  currentUserId: number | null;
}) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [filteredPosts, setFilteredPosts] = useState(tools);
  const [postFiltersState, setPostFiltersState] = useState<PostFilterState>({
    name: "",
    location: "",
    min_borrow_days: 0,
    max_deposit: 0,
  });

  const postRefs = useRef<{ [id: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    setFilteredPosts(
      tools.filter(
        (post) =>
          post.tool_name
            .toLowerCase()
            .includes(postFiltersState.name.toLowerCase()) &&
          post.max_borrow_days > postFiltersState.min_borrow_days &&
          (postFiltersState.max_deposit <= 0 ||
            post.deposit <= postFiltersState.max_deposit) &&
          post.postcode
            .toLowerCase()
            .includes(postFiltersState.location.toLowerCase())
      )
    );
  }, [tools, postFiltersState]);

  return (
    <PostsContext.Provider value={{ selectedPostId, setSelectedPostId }}>
      <APIProvider apiKey={API_KEY}>
        <div className="pt-2 lg:max-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-64px)]">
          <div className="flex w-full items-center justify-center gap-2">
            <p>Have a tool to share?</p>
            <Button variant="outline" asChild>
              {/* This link needs to be an anchor element not a Next Link to prevent issues when submitting the form on
            /tools/new page. For reference: https://github.com/vercel/next.js/discussions/56234 */}
              <Link href="/tools/new">
                <Plus />
                Share Tool
              </Link>
            </Button>
          </div>

          <div className="grid min-h-[calc(100vh-124px)] grid-cols-2 grid-rows-1 gap-2 p-2 lg:px-4">
            <div className="col-span-2 row-span-1 flex flex-col gap-2 lg:col-span-1">
              <div className="flex h-72 grow items-center justify-center overflow-clip rounded-md border bg-gray-500">
                <ToolsMap tools={filteredPosts} postRefs={postRefs} />
              </div>

              <PostFiltersForm
                setPostFiltersState={setPostFiltersState}
                postFiltersState={postFiltersState}
              />
            </div>

            <ScrollArea className="col-span-2 lg:col-span-1 lg:max-h-[calc(100vh-124px)]">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isHighlighted={post.id == selectedPostId}
                    loggedIn={loggedIn}
                    currentUserId={currentUserId}
                    ref={(element) => {
                      postRefs.current[post.id] = element;
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </APIProvider>
    </PostsContext.Provider>
  );
}
