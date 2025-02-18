import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import { getTools } from "@/lib/actions";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

// TODO: move all types to actions file
type Tool = {
  id: number;
  user_id: number;
  tool_name: string;
  description: string;
  deposit: number;
  max_borrow_days: number;
  location_id: number;
  status: string;
};

const toolsColumns: ColumnDef<Tool>[] = [
  { accessorKey: "tool_name", header: "Name" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "deposit", header: "Deposit" },
  { accessorKey: "max_borrow_days", header: "Max Borrow Time (days)" },
  { accessorKey: "location_id", header: "Location" },
  { accessorKey: "status", header: "Status" },
];

export default async function ToolsPage() {
  const tools = await getTools();

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

      <DataTable columns={toolsColumns} data={tools} />
    </div>
  );
}
