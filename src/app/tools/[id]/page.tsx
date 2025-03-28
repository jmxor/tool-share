import PostDetailsContent from "@/components/posts/post-details-content";
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

  return <PostDetailsContent post={post} />;
}
