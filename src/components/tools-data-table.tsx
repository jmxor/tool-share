"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import { AllToolPostData } from "@/lib/posts/actions";
import { ColumnDef } from "@tanstack/react-table";
import { CircleCheck } from "lucide-react";

const toolsColumns: ColumnDef<AllToolPostData>[] = [
  {
    accessorKey: "tool_name",
    header: "Tool Name",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue("tool_name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="truncate">{row.getValue("description")}</div>
    ),
  },
  { accessorKey: "deposit", header: "Deposit" },
  {
    accessorKey: "max_borrow_days",
    header: "Borrow Limit",
    cell: ({ row }) => {
      const max_borrow_days = parseInt(row.getValue("max_borrow_days"));
      return <div className="whitespace-nowrap">{max_borrow_days} days</div>;
    },
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
    cell: ({ row }) => (
      <div className="whitespace-nowrap"> {row.getValue("postcode")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",

    cell: () => (
      <div>
        <Badge>
          Available <CircleCheck size={14} className="ml-1" />
        </Badge>
      </div>
    ),
  },
  {
    id: "borrow_btn",
    cell: () => <Button size="sm">Borrow</Button>,
  },
];

export default function ToolsDataTable({ data }: { data: AllToolPostData[] }) {
  return <DataTable columns={toolsColumns} data={data} />;
}
