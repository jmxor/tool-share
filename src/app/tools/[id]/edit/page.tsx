import { getToolById } from "@/lib/posts/actions";
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

  return <h1>{post.tool_name}</h1>;
}
