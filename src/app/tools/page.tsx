import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="grid grid-cols-1 gap-2 p-2 lg:grid-cols-2 lg:px-4">
      <div className="flex items-center justify-center gap-2 lg:col-span-2">
        <p>Have a tool to share?</p>
        <Button variant="outline" asChild>
          <Link href="/tools/new">
            <Plus />
            Share Tool
          </Link>
        </Button>
      </div>

      <div className="flex h-36 items-center justify-center rounded-md border px-4 py-2">
        <h1>Map Section</h1>
      </div>

      <div className="col-span-1 flex h-36 items-center justify-center rounded-md border px-4 py-2">
        <h1>Table Section</h1>
      </div>
    </div>
  );
}
