import { auth } from "@/auth";
import NewToolForm from "@/components/new-tool-form";
import { getCategories } from "@/lib/posts/actions";
import { redirect } from "next/navigation";

export default async function NewToolPage() {
  let categories = await getCategories();
  if (!categories) {
    categories = [];
  }

  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50 px-4">
      <NewToolForm categories={categories} />
    </div>
  );
}
