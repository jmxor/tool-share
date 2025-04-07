import { auth } from "@/auth";
import EditPostForm from "@/components/posts/edit-post-form";
import { getEmailID } from "@/lib/auth/actions";
import { getCategories, getToolById } from "@/lib/posts/actions";
import { getOpenTransactionsForPostId } from "@/lib/transactions/actions";
import { notFound } from "next/navigation";

export default async function PostEditPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  const post = await getToolById(id);
  if (!post) {
    notFound();
  }

  const session = await auth();
  let currentUserId: number | null = null;

  if (session?.user?.email) {
    currentUserId = await getEmailID(session.user.email);
  }

  if (currentUserId != post.user_id) {
    return notFound();
  }

  let categories = await getCategories();
  if (!categories) {
    categories = [];
  }

  let hasOpenTransactions = false;
  const openTransactions = await getOpenTransactionsForPostId(post.id);
  if (openTransactions == null || openTransactions.rows.length > 0) {
    hasOpenTransactions = true;
  }

  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50 px-4">
      <EditPostForm
        post={post}
        categories={categories}
        hasOpenTransactions={hasOpenTransactions}
      />
    </div>
  );
}
