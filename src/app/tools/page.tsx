import ToolsDataTable from "@/components/tools-data-table";
import { Button } from "@/components/ui/button";
import { getTools } from "@/lib/posts/actions";
import { Plus } from "lucide-react";

export default async function ToolsPage() {
  let tools = await getTools();
  if (!tools) {
    tools = [];
  }

  return (
    <div className="grid grid-cols-1 gap-2 p-2 lg:grid-cols-2 lg:px-4">
      <div className="flex items-center justify-center gap-2 lg:col-span-2">
        <p>Have a tool to share?</p>
        <Button variant="outline" asChild>
          {/* This link needs to be an anchor element not a Next Link to prevent issues when submitting the form on
          /tools/new page. For reference: https://github.com/vercel/next.js/discussions/56234 */}
          <a href="/tools/new">
            <Plus />
            Share Tool
          </a>
        </Button>
      </div>

      <div className="flex h-36 items-center justify-center rounded-md border px-4 py-2">
        <h1>Map Section</h1>
      </div>

      <ToolsDataTable data={tools} />
    </div>
  );
}
