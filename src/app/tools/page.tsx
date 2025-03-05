import ToolsPageContent from "@/components/tools-page-content";
import { getTools } from "@/lib/posts/actions";

export default async function ToolsPage() {
  let tools = await getTools();
  if (!tools) {
    tools = [];
  }

  return <ToolsPageContent tools={tools} />;
}
