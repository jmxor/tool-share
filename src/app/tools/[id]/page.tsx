import PostImageCarousel from "@/components/posts/post-image-carousel";
import { getToolById } from "@/lib/posts/actions";
import { notFound } from "next/navigation";

export default async function PostDetailsPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const post = await getToolById((await params).id);
  if (!post) {
    notFound();
  }

  return (
    <div className="mb-auto flex min-h-[calc(100vh-64px)] w-full flex-1 justify-center bg-gray-50 px-4">
      <div className="my-4 h-fit w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h2 className="mt-0 text-center text-3xl font-bold text-gray-800">
          Tool Details
        </h2>

        <div className="space-y-2 p-2 lg:px-4">
          <PostImageCarousel pictures={post?.pictures} />

          <div className="space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Name
            </label>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
              {post?.tool_name}
            </div>
          </div>
          <div className="space-y-0.5">
            <label htmlFor="" className="text-sm font-medium">
              Description
            </label>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm">
              {post?.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
