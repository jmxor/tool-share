import { auth } from "@/auth";
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

  const session = await auth();
  let loggedIn = false;

  if (session?.user?.email) {
    loggedIn = true;
  }

  return <PostDetailsContent post={post} loggedIn={loggedIn} />;
}
