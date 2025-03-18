import NewToolForm from "@/components/new-tool-form";
import { getCategories } from "@/lib/posts/actions";

export default async function NewToolPage() {
  let categories = await getCategories();
  if (!categories) {
    categories = [];
  }

  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50 px-4">
      <NewToolForm categories={categories} />
    </div>
  );
}
