import EditPostForm from "@/components/posts/edit-post-form";
import { getCategories, getToolById } from "@/lib/posts/actions";
import { notFound } from "next/navigation";

export default async function PostEditPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const post = await getToolById((await params).id);
  if (!post) {
    notFound();
  }

  let categories = await getCategories();
  if (!categories) {
    categories = [];
  }

  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50 px-4">
      <EditPostForm post={post} categories={categories} />
    </div>
  );
}
