import NewToolForm from "@/components/new-tool-form";
import { getPostCategories } from "@/lib/actions";

export default async function NewToolPage() {
  const categories = await getPostCategories();

  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50 px-4">
      <NewToolForm categories={categories} />
    </div>
  );
}
